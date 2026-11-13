package com.dove.adapter.scheduler;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.application.DrawRepository;
import com.dove.application.IngestDrawsUseCase;
import com.dove.application.ResultSource;
import com.dove.application.StationSchedulePort;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DrawPollScheduler Specification (T04.15)")
class DrawPollSchedulerTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private InMemoryDrawRepository drawRepository;
  private FakeSchedulePort schedulePort;
  private TrackingIngestUseCase ingestUseCase;

  static class InMemoryDrawRepository implements DrawRepository {
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

  static class FakeSchedulePort implements StationSchedulePort {
    private List<String> stations = List.of();

    public void setStations(List<String> stations) {
      this.stations = stations;
    }

    @Override
    public List<String> getDrawingStationCodes(LocalDate drawDate) {
      return stations;
    }
  }

  static class TrackingIngestUseCase extends IngestDrawsUseCase {
    final AtomicInteger callCount = new AtomicInteger(0);

    public TrackingIngestUseCase(
        StationSchedulePort schedulePort,
        ResultSource resultSource,
        DrawRepository drawRepository) {
      super(schedulePort, resultSource, drawRepository);
    }

    @Override
    public IngestSummary ingestForDate(LocalDate date) {
      callCount.incrementAndGet();
      return new IngestSummary(date, 0, 0, 0, 0);
    }
  }

  @BeforeEach
  void setUp() {
    drawRepository = new InMemoryDrawRepository();
    schedulePort = new FakeSchedulePort();
    ingestUseCase =
        new TrackingIngestUseCase(
            schedulePort, (station, date) -> Optional.empty(), drawRepository);
  }

  private Clock fixedClockAt(String isoInstant) {
    return Clock.fixed(Instant.parse(isoInstant), VN_ZONE);
  }

  @Test
  @DisplayName("pollScheduledDraws outside window (15:00) does not invoke ingestion")
  void outsideWindowDoesNotPoll() {
    // 15:00 VN time is 08:00 UTC
    Clock clock = fixedClockAt("2026-11-02T08:00:00Z");
    DrawPollScheduler scheduler =
        new DrawPollScheduler(ingestUseCase, schedulePort, drawRepository, clock);

    scheduler.pollScheduledDraws();

    assertThat(ingestUseCase.callCount.get()).isEqualTo(0);
  }

  @Test
  @DisplayName(
      "pollScheduledDraws inside window (16:30) triggers ingestion when stations incomplete")
  void insideWindowTriggersIngestionWhenIncomplete() {
    // 16:30 VN time is 09:30 UTC
    Clock clock = fixedClockAt("2026-11-02T09:30:00Z");
    schedulePort.setStations(List.of("tp-hcm", "dong-thap"));

    DrawPollScheduler scheduler =
        new DrawPollScheduler(ingestUseCase, schedulePort, drawRepository, clock);

    scheduler.pollScheduledDraws();

    assertThat(ingestUseCase.callCount.get()).isEqualTo(1);
  }

  @Test
  @DisplayName("pollScheduledDraws stops early when all stations already have complete 18 numbers")
  void insideWindowStopsEarlyWhenComplete() {
    // 16:45 VN time is 09:45 UTC
    Clock clock = fixedClockAt("2026-11-02T09:45:00Z");
    LocalDate date = LocalDate.of(2026, 11, 2);
    schedulePort.setStations(List.of("tp-hcm"));

    DrawResult completeDraw =
        new DrawResult(
            "tp-hcm",
            date,
            Map.of(
                PrizeTier.SPECIAL, List.of("482915"),
                PrizeTier.FIRST, List.of("73924"),
                PrizeTier.SECOND, List.of("81057"),
                PrizeTier.THIRD, List.of("62481", "90135"),
                PrizeTier.FOURTH,
                    List.of("17523", "49182", "30819", "65471", "82934", "10283", "74659"),
                PrizeTier.FIFTH, List.of("5928"),
                PrizeTier.SIXTH, List.of("8192", "3048", "6721"),
                PrizeTier.SEVENTH, List.of("395"),
                PrizeTier.EIGHTH, List.of("15")));
    drawRepository.save(completeDraw, "SEED");

    DrawPollScheduler scheduler =
        new DrawPollScheduler(ingestUseCase, schedulePort, drawRepository, clock);

    scheduler.pollScheduledDraws();

    // Ingestion should NOT be called because all stations are already complete
    assertThat(ingestUseCase.callCount.get()).isEqualTo(0);
  }

  @Test
  @DisplayName(
      "Custom configured window start and end (e.g. 10:00 - 11:00) works without code modification")
  void customWindowConfiguration() {
    DrawPollScheduler customScheduler =
        new DrawPollScheduler(
            ingestUseCase,
            schedulePort,
            drawRepository,
            fixedClockAt("2026-11-02T03:30:00Z"), // 10:30 VN
            "10:00",
            "11:00");

    assertThat(customScheduler.getWindowStart()).isEqualTo(java.time.LocalTime.of(10, 0));
    assertThat(customScheduler.getWindowEnd()).isEqualTo(java.time.LocalTime.of(11, 0));
    assertThat(customScheduler.isWithinWindow(java.time.LocalTime.of(10, 30))).isTrue();
    assertThat(customScheduler.isWithinWindow(java.time.LocalTime.of(11, 30))).isFalse();
  }
}
