package com.dove.application;

import com.dove.domain.DrawResult;
import jakarta.annotation.PreDestroy;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Single-flight on-demand backfill coordinator for missing past lottery draws. Ensures concurrent
 * API requests for an un-ingested past date trigger at most one upstream scrape, with a cooldown
 * window when upstream results are not yet available.
 */
@Service
public class OnDemandDrawBackfillService {

  private static final Logger log = LoggerFactory.getLogger(OnDemandDrawBackfillService.class);

  public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  public static final LocalTime TODAY_READY_CUTOFF = LocalTime.of(16, 40);
  public static final int DEFAULT_MAX_PAST_DAYS = 90;
  private static final Duration JOIN_TIMEOUT = Duration.ofSeconds(15);

  /**
   * Default time a request thread waits for an on-demand backfill (T13.04). Must stay below the
   * mobile client's 10s timeout; a slower scrape keeps running in the background.
   */
  public static final Duration DEFAULT_REQUEST_WAIT = Duration.ofSeconds(6);

  private final IngestDrawsUseCase ingestUseCase;
  private final StationSchedulePort schedulePort;
  private final DrawRepository drawRepository;
  private final Clock clock;
  private final boolean enabled;
  private final int maxPastDays;
  private final Duration cooldown;
  private final Duration requestWait;

  private final ConcurrentHashMap<LocalDate, CompletableFuture<Void>> inFlight =
      new ConcurrentHashMap<>();
  private final ConcurrentHashMap<LocalDate, Instant> cooldownUntil = new ConcurrentHashMap<>();
  private final ExecutorService backgroundExecutor =
      Executors.newFixedThreadPool(
          2,
          r -> {
            Thread t = new Thread(r, "dove-ondemand-backfill");
            t.setDaemon(true);
            return t;
          });

  @Autowired
  public OnDemandDrawBackfillService(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Optional<Clock> clock,
      @Value("${dove.ingestion.on-demand-backfill.enabled:true}") boolean enabled,
      @Value("${dove.ingestion.on-demand-backfill.max-past-days:90}") int maxPastDays,
      @Value("${dove.ingestion.on-demand-backfill.cooldown-seconds:60}") long cooldownSeconds,
      @Value("${dove.ingestion.on-demand-backfill.request-wait-ms:6000}") long requestWaitMs) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock.orElseGet(() -> Clock.system(VN_ZONE)),
        enabled,
        maxPastDays,
        Duration.ofSeconds(Math.max(1L, cooldownSeconds)),
        Duration.ofMillis(Math.max(0L, requestWaitMs)));
  }

  public OnDemandDrawBackfillService(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      boolean enabled,
      int maxPastDays,
      Duration cooldown) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock,
        enabled,
        maxPastDays,
        cooldown,
        DEFAULT_REQUEST_WAIT);
  }

  public OnDemandDrawBackfillService(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      boolean enabled,
      int maxPastDays,
      Duration cooldown,
      Duration requestWait) {
    this.ingestUseCase = Objects.requireNonNull(ingestUseCase, "ingestUseCase must not be null");
    this.schedulePort = Objects.requireNonNull(schedulePort, "schedulePort must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.clock = Objects.requireNonNull(clock, "clock must not be null");
    this.enabled = enabled;
    this.maxPastDays = maxPastDays;
    this.cooldown = Objects.requireNonNull(cooldown, "cooldown must not be null");
    this.requestWait = Objects.requireNonNull(requestWait, "requestWait must not be null");
  }

  @PreDestroy
  void shutdown() {
    backgroundExecutor.shutdownNow();
  }

  /**
   * Ensures the latest expected completed draw date (today if >= 16:40 ICT, otherwise yesterday)
   * has been ingested into the repository. Blocks until done (scheduler / startup use).
   */
  public void ensureLatestCompletedDateIngested() {
    if (!enabled) {
      return;
    }
    ensureDateIngested(latestExpectedCompletedDate());
  }

  /**
   * Request-path variant of {@link #ensureLatestCompletedDateIngested()} that waits at most the
   * request budget (T13.04).
   */
  public void ensureLatestCompletedDateIngestedForRequest() {
    if (!enabled) {
      return;
    }
    ensureDateIngestedForRequest(latestExpectedCompletedDate());
  }

  /**
   * Returns today in Vietnam timezone if current time is at or after 16:40 ICT, otherwise
   * yesterday.
   */
  public LocalDate latestExpectedCompletedDate() {
    ZonedDateTime nowVn = ZonedDateTime.now(clock.withZone(VN_ZONE));
    LocalDate today = nowVn.toLocalDate();
    return nowVn.toLocalTime().isBefore(TODAY_READY_CUTOFF) ? today.minusDays(1) : today;
  }

  /**
   * Ensures all scheduled stations for {@code date} are stored and complete, performing a
   * single-flight upstream backfill when eligible. Blocks until the backfill finishes; meant for
   * the scheduler and the startup catch-up, not for HTTP request threads.
   */
  public void ensureDateIngested(LocalDate date) {
    if (!shouldAttempt(date)) {
      return;
    }
    CompletableFuture<Void> ownFuture = new CompletableFuture<>();
    CompletableFuture<Void> existing = inFlight.putIfAbsent(date, ownFuture);
    if (existing != null) {
      awaitQuietly(existing, JOIN_TIMEOUT);
      return;
    }
    runLeader(date, ownFuture);
  }

  /**
   * Same as {@link #ensureDateIngested(LocalDate)} but never blocks the caller longer than the
   * request budget (default 6s, below the app's 10s timeout). The upstream scrape runs on a
   * background thread and keeps going after the budget expires, so a later request finds the data
   * (T13.04).
   */
  public void ensureDateIngestedForRequest(LocalDate date) {
    if (!shouldAttempt(date)) {
      return;
    }
    CompletableFuture<Void> ownFuture = new CompletableFuture<>();
    CompletableFuture<Void> existing = inFlight.putIfAbsent(date, ownFuture);
    if (existing != null) {
      awaitQuietly(existing, requestWait);
      return;
    }
    try {
      backgroundExecutor.execute(() -> runLeader(date, ownFuture));
    } catch (RuntimeException rejected) {
      // Executor shut down (application stopping): release the slot and give up quietly.
      inFlight.remove(date, ownFuture);
      ownFuture.complete(null);
      return;
    }
    awaitQuietly(ownFuture, requestWait);
  }

  public boolean isDateComplete(LocalDate date) {
    List<String> stations = schedulePort.getDrawingStationCodes(date);
    if (stations.isEmpty()) {
      return true;
    }
    return stations.stream()
        .allMatch(
            code ->
                drawRepository
                    .findByStationAndDate(code, date)
                    .map(DrawResult::isComplete)
                    .orElse(false));
  }

  private boolean shouldAttempt(LocalDate date) {
    if (!enabled || date == null || !isEligibleForBackfill(date)) {
      return false;
    }
    if (isDateComplete(date)) {
      return false;
    }
    Instant blockedUntil = cooldownUntil.get(date);
    return blockedUntil == null || !clock.instant().isBefore(blockedUntil);
  }

  private void runLeader(LocalDate date, CompletableFuture<Void> ownFuture) {
    try {
      if (!isDateComplete(date)) {
        log.info("Kích hoạt on-demand backfill kỳ quay thiếu ngày [{}]", date);
        IngestDrawsUseCase.IngestSummary summary = ingestUseCase.ingestForDate(date);
        if (isDateComplete(date)) {
          cooldownUntil.remove(date);
          log.info(
              "Hoàn tất on-demand backfill ngày [{}] (lưu mới {}/{} đài)",
              date,
              summary.newlySaved(),
              summary.totalStations());
        } else {
          cooldownUntil.put(date, clock.instant().plus(cooldown));
          log.warn(
              "On-demand backfill ngày [{}] chưa đủ đài (thiếu {}), tạm hoãn {}s",
              date,
              summary.failedOrUnavailable(),
              cooldown.toSeconds());
        }
      }
    } catch (Exception ex) {
      cooldownUntil.put(date, clock.instant().plus(cooldown));
      log.error("Lỗi khi chạy on-demand backfill ngày [{}]: {}", date, ex.getMessage(), ex);
    } finally {
      inFlight.remove(date, ownFuture);
      ownFuture.complete(null);
    }
  }

  private boolean isEligibleForBackfill(LocalDate date) {
    ZonedDateTime nowVn = ZonedDateTime.now(clock.withZone(VN_ZONE));
    LocalDate today = nowVn.toLocalDate();
    if (date.isAfter(today)) {
      return false;
    }
    if (date.equals(today) && nowVn.toLocalTime().isBefore(TODAY_READY_CUTOFF)) {
      return false;
    }
    long daysAgo = ChronoUnit.DAYS.between(date, today);
    return daysAgo >= 0 && daysAgo <= maxPastDays;
  }

  private static void awaitQuietly(CompletableFuture<Void> future, Duration maxWait) {
    try {
      future.get(maxWait.toMillis(), TimeUnit.MILLISECONDS);
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
    } catch (TimeoutException ex) {
      log.debug(
          "On-demand backfill vẫn chạy nền sau {} ms, trả dữ liệu hiện có", maxWait.toMillis());
    } catch (Exception ignored) {
      // Failed on leader thread; caller will proceed with whatever DB holds.
    }
  }
}
