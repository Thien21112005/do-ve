package com.dove.adapter.scheduler;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.application.DrawRepository;
import com.dove.application.IngestDrawsUseCase;
import com.dove.application.StationSchedulePort;
import com.dove.domain.DrawResult;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Scheduler Window and Midnight Clock Verification (T04.17 / R-05)")
class SchedulerClockWindowTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  static class StubDrawRepository implements DrawRepository {
    private final Map<String, DrawResult> store = new HashMap<>();

    @Override
    public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
      return Optional.ofNullable(store.get(stationCode + "#" + drawDate));
    }

    @Override
    public Optional<DrawResult> findLatestByStation(String stationCode) {
      return Optional.empty();
    }

    @Override
    public Optional<DrawResult> findLatestOverall() {
      return Optional.empty();
    }

    @Override
    public DrawResult save(DrawResult drawResult, String source) {
      store.put(drawResult.stationCode() + "#" + drawResult.drawDate(), drawResult);
      return drawResult;
    }

    @Override
    public boolean saveIfAbsent(DrawResult drawResult, String source) {
      String key = drawResult.stationCode() + "#" + drawResult.drawDate();
      if (store.containsKey(key)) {
        return false;
      }
      store.put(key, drawResult);
      return true;
    }
  }

  static class StubSchedulePort implements StationSchedulePort {
    @Override
    public List<String> getDrawingStationCodes(LocalDate drawDate) {
      return List.of("tp-hcm", "dong-thap");
    }
  }

  static class RecordingIngestUseCase extends IngestDrawsUseCase {
    final AtomicInteger callCount = new AtomicInteger(0);
    final AtomicReference<LocalDate> ingestedDate = new AtomicReference<>();

    public RecordingIngestUseCase(StationSchedulePort schedulePort, DrawRepository drawRepository) {
      super(schedulePort, (st, dt) -> Optional.empty(), drawRepository);
    }

    @Override
    public IngestSummary ingestForDate(LocalDate date) {
      callCount.incrementAndGet();
      ingestedDate.set(date);
      return new IngestSummary(date, 2, 0, 0, 2);
    }
  }

  private Clock fixedClock(String isoUtcInstant) {
    return Clock.fixed(Instant.parse(isoUtcInstant), VN_ZONE);
  }

  @Test
  @DisplayName("Case 1: Before 16:10 (e.g. 16:09 VN) does not trigger polling")
  void testCase1Before1610() {
    // 16:09:30 VN = 09:09:30 UTC
    Clock clock = fixedClock("2026-11-02T09:09:30Z");
    StubSchedulePort schedulePort = new StubSchedulePort();
    StubDrawRepository repository = new StubDrawRepository();
    RecordingIngestUseCase useCase = new RecordingIngestUseCase(schedulePort, repository);

    DrawPollScheduler scheduler = new DrawPollScheduler(useCase, schedulePort, repository, clock);
    scheduler.pollScheduledDraws();

    assertThat(useCase.callCount.get()).isEqualTo(0);
  }

  @Test
  @DisplayName("Case 2: Inside window (e.g. 16:30 VN) triggers ingestion for today")
  void testCase2InsideWindow() {
    // 16:30:00 VN = 09:30:00 UTC
    Clock clock = fixedClock("2026-11-02T09:30:00Z");
    StubSchedulePort schedulePort = new StubSchedulePort();
    StubDrawRepository repository = new StubDrawRepository();
    RecordingIngestUseCase useCase = new RecordingIngestUseCase(schedulePort, repository);

    DrawPollScheduler scheduler = new DrawPollScheduler(useCase, schedulePort, repository, clock);
    scheduler.pollScheduledDraws();

    assertThat(useCase.callCount.get()).isEqualTo(1);
    assertThat(useCase.ingestedDate.get()).isEqualTo(LocalDate.of(2026, 11, 2));
  }

  @Test
  @DisplayName("Case 3: After 17:30 (e.g. 17:31 VN) does not trigger polling")
  void testCase3After1730() {
    // 17:31:00 VN = 10:31:00 UTC
    Clock clock = fixedClock("2026-11-02T10:31:00Z");
    StubSchedulePort schedulePort = new StubSchedulePort();
    StubDrawRepository repository = new StubDrawRepository();
    RecordingIngestUseCase useCase = new RecordingIngestUseCase(schedulePort, repository);

    DrawPollScheduler scheduler = new DrawPollScheduler(useCase, schedulePort, repository, clock);
    scheduler.pollScheduledDraws();

    assertThat(useCase.callCount.get()).isEqualTo(0);
  }

  @Test
  @DisplayName(
      "Case 4: Around midnight boundary (23:59:59 and 00:00:01) handles date rollover properly without errors (R-05)")
  void testCase4AroundMidnight() {
    StubSchedulePort schedulePort = new StubSchedulePort();
    StubDrawRepository repository = new StubDrawRepository();

    // 23:59:59 VN on 2026-11-02 = 16:59:59 UTC
    Clock clockBeforeMidnight = fixedClock("2026-11-02T16:59:59Z");
    RecordingIngestUseCase useCaseBefore = new RecordingIngestUseCase(schedulePort, repository);
    DrawPollScheduler schedulerBefore =
        new DrawPollScheduler(useCaseBefore, schedulePort, repository, clockBeforeMidnight);

    schedulerBefore.pollScheduledDraws();
    assertThat(useCaseBefore.callCount.get()).isEqualTo(0);
    assertThat(LocalDate.now(clockBeforeMidnight)).isEqualTo(LocalDate.of(2026, 11, 2));

    // 00:00:05 VN on 2026-11-03 = 17:00:05 UTC on 2026-11-02
    Clock clockAfterMidnight = fixedClock("2026-11-02T17:00:05Z");
    RecordingIngestUseCase useCaseAfter = new RecordingIngestUseCase(schedulePort, repository);
    DrawPollScheduler schedulerAfter =
        new DrawPollScheduler(useCaseAfter, schedulePort, repository, clockAfterMidnight);

    schedulerAfter.pollScheduledDraws();
    assertThat(useCaseAfter.callCount.get()).isEqualTo(0);
    assertThat(LocalDate.now(clockAfterMidnight)).isEqualTo(LocalDate.of(2026, 11, 3));
  }
}
