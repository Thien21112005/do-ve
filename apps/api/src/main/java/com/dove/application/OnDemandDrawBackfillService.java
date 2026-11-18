package com.dove.application;

import com.dove.domain.DrawResult;
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
import java.util.concurrent.TimeUnit;
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
  private static final long JOIN_TIMEOUT_SECONDS = 15L;

  private final IngestDrawsUseCase ingestUseCase;
  private final StationSchedulePort schedulePort;
  private final DrawRepository drawRepository;
  private final Clock clock;
  private final boolean enabled;
  private final int maxPastDays;
  private final Duration cooldown;

  private final ConcurrentHashMap<LocalDate, CompletableFuture<Void>> inFlight =
      new ConcurrentHashMap<>();
  private final ConcurrentHashMap<LocalDate, Instant> cooldownUntil = new ConcurrentHashMap<>();

  @Autowired
  public OnDemandDrawBackfillService(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Optional<Clock> clock,
      @Value("${dove.ingestion.on-demand-backfill.enabled:true}") boolean enabled,
      @Value("${dove.ingestion.on-demand-backfill.max-past-days:90}") int maxPastDays,
      @Value("${dove.ingestion.on-demand-backfill.cooldown-seconds:60}") long cooldownSeconds) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock.orElseGet(() -> Clock.system(VN_ZONE)),
        enabled,
        maxPastDays,
        Duration.ofSeconds(Math.max(1L, cooldownSeconds)));
  }

  public OnDemandDrawBackfillService(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      boolean enabled,
      int maxPastDays,
      Duration cooldown) {
    this.ingestUseCase = Objects.requireNonNull(ingestUseCase, "ingestUseCase must not be null");
    this.schedulePort = Objects.requireNonNull(schedulePort, "schedulePort must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.clock = Objects.requireNonNull(clock, "clock must not be null");
    this.enabled = enabled;
    this.maxPastDays = maxPastDays;
    this.cooldown = Objects.requireNonNull(cooldown, "cooldown must not be null");
  }

  /**
   * Ensures the latest expected completed draw date (today if >= 16:40 ICT, otherwise yesterday)
   * has been ingested into the repository.
   */
  public void ensureLatestCompletedDateIngested() {
    if (!enabled) {
      return;
    }
    ensureDateIngested(latestExpectedCompletedDate());
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
   * single-flight upstream backfill when eligible.
   */
  public void ensureDateIngested(LocalDate date) {
    if (!enabled || date == null || !isEligibleForBackfill(date)) {
      return;
    }
    if (isDateComplete(date)) {
      return;
    }

    Instant now = clock.instant();
    Instant blockedUntil = cooldownUntil.get(date);
    if (blockedUntil != null && now.isBefore(blockedUntil)) {
      return;
    }

    CompletableFuture<Void> ownFuture = new CompletableFuture<>();
    CompletableFuture<Void> existing = inFlight.putIfAbsent(date, ownFuture);
    if (existing != null) {
      awaitQuietly(existing);
      return;
    }

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

  private static void awaitQuietly(CompletableFuture<Void> future) {
    try {
      future.get(JOIN_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
    } catch (Exception ignored) {
      // Timed out or failed on leader thread; caller will proceed with whatever DB holds.
    }
  }
}
