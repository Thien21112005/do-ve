package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T12.01 - OnDemandDrawBackfillService Unit Tests")
class OnDemandDrawBackfillServiceTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private InMemoryDrawRepository drawRepository;
  private StationSchedulePort schedulePort;
  private AtomicReference<Instant> currentInstant;
  private Clock mutableClock;

  static class InMemoryDrawRepository implements DrawRepository {
    private final Map<String, DrawResult> store = new ConcurrentHashMap<>();

    @Override
    public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
      return Optional.ofNullable(store.get(stationCode + ":" + drawDate));
    }

    @Override
    public Optional<DrawResult> findLatestByStation(String stationCode) {
      return store.values().stream()
          .filter(d -> d.stationCode().equals(stationCode))
          .max((a, b) -> a.drawDate().compareTo(b.drawDate()));
    }

    @Override
    public Optional<DrawResult> findLatestOverall() {
      return store.values().stream().max((a, b) -> a.drawDate().compareTo(b.drawDate()));
    }

    @Override
    public DrawResult save(DrawResult drawResult, String source) {
      store.put(drawResult.stationCode() + ":" + drawResult.drawDate(), drawResult);
      return drawResult;
    }

    @Override
    public boolean saveIfAbsent(DrawResult drawResult, String source) {
      return store.putIfAbsent(drawResult.stationCode() + ":" + drawResult.drawDate(), drawResult)
          == null;
    }
  }

  private static DrawResult completeDraw(String station, LocalDate date) {
    Map<PrizeTier, List<String>> numbers = new HashMap<>();
    numbers.put(PrizeTier.EIGHTH, List.of("12"));
    numbers.put(PrizeTier.SEVENTH, List.of("123"));
    numbers.put(PrizeTier.SIXTH, List.of("1234", "2345", "3456"));
    numbers.put(PrizeTier.FIFTH, List.of("4567"));
    numbers.put(
        PrizeTier.FOURTH, List.of("10001", "10002", "10003", "10004", "10005", "10006", "10007"));
    numbers.put(PrizeTier.THIRD, List.of("20001", "20002"));
    numbers.put(PrizeTier.SECOND, List.of("30001"));
    numbers.put(PrizeTier.FIRST, List.of("40001"));
    numbers.put(PrizeTier.SPECIAL, List.of("054321"));
    return new DrawResult(station, date, numbers);
  }

  @BeforeEach
  void setUp() {
    drawRepository = new InMemoryDrawRepository();
    schedulePort = date -> List.of("ben-tre", "vung-tau", "bac-lieu");
    // 2026-11-18 14:40 ICT = 2026-11-18T07:40:00Z
    currentInstant = new AtomicReference<>(Instant.parse("2026-11-18T07:40:00Z"));
    mutableClock =
        new Clock() {
          @Override
          public ZoneId getZone() {
            return VN_ZONE;
          }

          @Override
          public Clock withZone(ZoneId zone) {
            return this;
          }

          @Override
          public Instant instant() {
            return currentInstant.get();
          }
        };
  }

  @Test
  @DisplayName(
      "Past date within 60 days missing draws triggers ingestForDate once and populates DB")
  void pastDateMissingDraws_triggersIngestOnce() {
    AtomicInteger sourceFetches = new AtomicInteger(0);
    ResultSource source =
        (stationCode, date) -> {
          sourceFetches.incrementAndGet();
          return Optional.of(completeDraw(stationCode, date));
        };
    IngestDrawsUseCase ingestUseCase = new IngestDrawsUseCase(schedulePort, source, drawRepository);
    OnDemandDrawBackfillService service =
        new OnDemandDrawBackfillService(
            ingestUseCase,
            schedulePort,
            drawRepository,
            mutableClock,
            true,
            60,
            Duration.ofSeconds(60));

    LocalDate yesterday = LocalDate.of(2026, 11, 17);
    service.ensureDateIngested(yesterday);

    assertThat(sourceFetches.get()).isEqualTo(3);
    assertThat(drawRepository.findByStationAndDate("ben-tre", yesterday)).isPresent();
    assertThat(drawRepository.findByStationAndDate("vung-tau", yesterday)).isPresent();
    assertThat(drawRepository.findByStationAndDate("bac-lieu", yesterday)).isPresent();

    // Subsequent call when already complete must not call source again
    service.ensureDateIngested(yesterday);
    assertThat(sourceFetches.get()).isEqualTo(3);
  }

  @Test
  @DisplayName("Skips future dates, today before 16:40 ICT, and dates older than 60 days")
  void skipsFutureTodayBeforeCutoffAndTooOldDates() {
    AtomicInteger sourceFetches = new AtomicInteger(0);
    ResultSource source =
        (stationCode, date) -> {
          sourceFetches.incrementAndGet();
          return Optional.of(completeDraw(stationCode, date));
        };
    IngestDrawsUseCase ingestUseCase = new IngestDrawsUseCase(schedulePort, source, drawRepository);
    OnDemandDrawBackfillService service =
        new OnDemandDrawBackfillService(
            ingestUseCase,
            schedulePort,
            drawRepository,
            mutableClock,
            true,
            60,
            Duration.ofSeconds(60));

    // Future date
    service.ensureDateIngested(LocalDate.of(2026, 11, 19));
    // Today at 14:40 ICT (before 16:40)
    service.ensureDateIngested(LocalDate.of(2026, 11, 18));
    // 61 days ago (2026-09-18)
    service.ensureDateIngested(LocalDate.of(2026, 9, 18));

    assertThat(sourceFetches.get()).isZero();

    // Advance clock to 16:45 ICT on 2026-11-18 (= 09:45Z) -> today becomes eligible!
    currentInstant.set(Instant.parse("2026-11-18T09:45:00Z"));
    service.ensureDateIngested(LocalDate.of(2026, 11, 18));
    assertThat(sourceFetches.get()).isEqualTo(3);
  }

  @Test
  @DisplayName("Single-flight: 5 concurrent callers for same date trigger ingest only once")
  void concurrentCallersSameDate_singleFlightIngestsOnce() throws Exception {
    AtomicInteger ingestInvocations = new AtomicInteger(0);
    CountDownLatch sourceEntered = new CountDownLatch(1);
    CountDownLatch releaseSource = new CountDownLatch(1);

    ResultSource slowSource =
        (stationCode, date) -> {
          if (stationCode.equals("ben-tre")) {
            ingestInvocations.incrementAndGet();
            sourceEntered.countDown();
            try {
              releaseSource.await(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            }
          }
          return Optional.of(completeDraw(stationCode, date));
        };

    IngestDrawsUseCase ingestUseCase =
        new IngestDrawsUseCase(schedulePort, slowSource, drawRepository);
    OnDemandDrawBackfillService service =
        new OnDemandDrawBackfillService(
            ingestUseCase,
            schedulePort,
            drawRepository,
            mutableClock,
            true,
            60,
            Duration.ofSeconds(60));

    LocalDate targetDate = LocalDate.of(2026, 11, 17);
    ExecutorService pool = Executors.newFixedThreadPool(5);
    CountDownLatch allDone = new CountDownLatch(5);

    for (int i = 0; i < 5; i++) {
      pool.submit(
          () -> {
            try {
              service.ensureDateIngested(targetDate);
            } finally {
              allDone.countDown();
            }
          });
    }

    assertThat(sourceEntered.await(3, TimeUnit.SECONDS)).isTrue();
    Thread.sleep(80);
    releaseSource.countDown();
    assertThat(allDone.await(5, TimeUnit.SECONDS)).isTrue();
    pool.shutdownNow();

    assertThat(ingestInvocations.get()).isEqualTo(1);
    assertThat(drawRepository.findByStationAndDate("bac-lieu", targetDate)).isPresent();
  }

  @Test
  @DisplayName("Applies 60s cooldown when external source fails so upstream is not spammed")
  void incompleteIngest_appliesCooldownUntilExpiry() {
    AtomicInteger attempts = new AtomicInteger(0);
    ResultSource unavailableSource =
        (stationCode, date) -> {
          attempts.incrementAndGet();
          return Optional.empty();
        };

    IngestDrawsUseCase ingestUseCase =
        new IngestDrawsUseCase(schedulePort, unavailableSource, drawRepository);
    OnDemandDrawBackfillService service =
        new OnDemandDrawBackfillService(
            ingestUseCase,
            schedulePort,
            drawRepository,
            mutableClock,
            true,
            60,
            Duration.ofSeconds(60));

    LocalDate targetDate = LocalDate.of(2026, 11, 17);

    // First attempt tries all 3 stations -> still incomplete -> enters 60s cooldown
    service.ensureDateIngested(targetDate);
    assertThat(attempts.get()).isEqualTo(3);

    // Second attempt 20s later is suppressed by cooldown
    currentInstant.set(currentInstant.get().plusSeconds(20));
    service.ensureDateIngested(targetDate);
    assertThat(attempts.get()).isEqualTo(3);

    // Third attempt 61s after initial failure retries
    currentInstant.set(currentInstant.get().plusSeconds(45));
    service.ensureDateIngested(targetDate);
    assertThat(attempts.get()).isEqualTo(6);
  }

  @Test
  @DisplayName(
      "ensureLatestCompletedDateIngested backfills yesterday before 16:40 and today after 16:40")
  void ensureLatestCompletedDateIngested_picksExpectedDay() {
    ResultSource source = (stationCode, date) -> Optional.of(completeDraw(stationCode, date));
    IngestDrawsUseCase ingestUseCase = new IngestDrawsUseCase(schedulePort, source, drawRepository);
    OnDemandDrawBackfillService service =
        new OnDemandDrawBackfillService(
            ingestUseCase,
            schedulePort,
            drawRepository,
            mutableClock,
            true,
            60,
            Duration.ofSeconds(60));

    // At 14:40 ICT on 18/11 -> yesterday 17/11 is backfilled
    service.ensureLatestCompletedDateIngested();
    assertThat(drawRepository.findByStationAndDate("ben-tre", LocalDate.of(2026, 11, 17)))
        .isPresent();
    assertThat(drawRepository.findByStationAndDate("ben-tre", LocalDate.of(2026, 11, 18)))
        .isEmpty();

    // At 16:45 ICT on 18/11 -> today 18/11 is backfilled
    currentInstant.set(Instant.parse("2026-11-18T09:45:00Z"));
    service.ensureLatestCompletedDateIngested();
    assertThat(drawRepository.findByStationAndDate("ben-tre", LocalDate.of(2026, 11, 18)))
        .isPresent();
  }

  @Test
  @DisplayName(
      "Review I5: default maxPastDays constant is 90 days matching SRS FR-RES-05 and CalendarPickerSheet")
  void defaultMaxPastDaysConstantIs90() {
    assertThat(OnDemandDrawBackfillService.DEFAULT_MAX_PAST_DAYS).isEqualTo(90);
  }
}
