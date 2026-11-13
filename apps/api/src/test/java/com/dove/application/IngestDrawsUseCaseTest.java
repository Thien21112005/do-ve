package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("IngestDrawsUseCase Orchestration Specification (T04.13, T04.14, T04.19)")
class IngestDrawsUseCaseTest {

  private InMemoryDrawRepository fakeDrawRepository;
  private FakeStationSchedulePort fakeSchedulePort;
  private TrackingFakeResultSource fakeResultSource;
  private IngestDrawsUseCase useCase;

  static class InMemoryDrawRepository implements DrawRepository {
    private final Map<String, DrawResult> database = new HashMap<>();

    @Override
    public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
      return Optional.ofNullable(database.get(stationCode + "#" + drawDate));
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
      database.put(drawResult.stationCode() + "#" + drawResult.drawDate(), drawResult);
      return drawResult;
    }

    @Override
    public boolean saveIfAbsent(DrawResult drawResult, String source) {
      String key = drawResult.stationCode() + "#" + drawResult.drawDate();
      if (database.containsKey(key)) {
        return false;
      }
      database.put(key, drawResult);
      return true;
    }
  }

  static class FakeStationSchedulePort implements StationSchedulePort {
    private List<String> stations = List.of();

    public void setStations(List<String> stations) {
      this.stations = stations;
    }

    @Override
    public List<String> getDrawingStationCodes(LocalDate drawDate) {
      return stations;
    }
  }

  static class TrackingFakeResultSource implements ResultSource {
    private final Map<String, DrawResult> store = new HashMap<>();
    final AtomicInteger callCount = new AtomicInteger(0);

    public void register(DrawResult drawResult) {
      store.put(drawResult.stationCode() + "#" + drawResult.drawDate(), drawResult);
    }

    @Override
    public Optional<DrawResult> fetch(String stationCode, LocalDate drawDate) {
      callCount.incrementAndGet();
      return Optional.ofNullable(store.get(stationCode + "#" + drawDate));
    }
  }

  @BeforeEach
  void setUp() {
    fakeDrawRepository = new InMemoryDrawRepository();
    fakeSchedulePort = new FakeStationSchedulePort();
    fakeResultSource = new TrackingFakeResultSource();
    useCase = new IngestDrawsUseCase(fakeSchedulePort, fakeResultSource, fakeDrawRepository);
  }

  @Test
  @DisplayName(
      "ingestForDate queries scheduled stations, fetches from source, and saves newly via saveIfAbsent")
  void ingestForDateSavesCorrectly() {
    LocalDate date = LocalDate.of(2026, 11, 2);
    fakeSchedulePort.setStations(List.of("tp-hcm", "dong-thap", "ca-mau"));

    DrawResult tphcm = new DrawResult("tp-hcm", date, Map.of(PrizeTier.SPECIAL, List.of("482915")));
    DrawResult dongThap =
        new DrawResult("dong-thap", date, Map.of(PrizeTier.SPECIAL, List.of("019283")));

    fakeResultSource.register(tphcm);
    fakeResultSource.register(dongThap);

    IngestDrawsUseCase.IngestSummary summary = useCase.ingestForDate(date);

    assertThat(summary.totalStations()).isEqualTo(3);
    assertThat(summary.newlySaved()).isEqualTo(2);
    assertThat(summary.alreadyExisted()).isEqualTo(0);
    assertThat(summary.failedOrUnavailable()).isEqualTo(1);

    assertThat(fakeDrawRepository.findByStationAndDate("tp-hcm", date)).contains(tphcm);
    assertThat(fakeDrawRepository.findByStationAndDate("dong-thap", date)).contains(dongThap);
    assertThat(fakeDrawRepository.findByStationAndDate("ca-mau", date)).isEmpty();
  }

  @Test
  @DisplayName(
      "skip draws that are already stored in repository, making zero calls to external source (T04.14)")
  void skipAlreadyStoredDrawsMakesZeroCallsToSource() {
    LocalDate date = LocalDate.of(2026, 11, 2);
    fakeSchedulePort.setStations(List.of("tp-hcm", "dong-thap"));

    DrawResult tphcm =
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
    DrawResult dongThap =
        new DrawResult(
            "dong-thap",
            date,
            Map.of(
                PrizeTier.SPECIAL, List.of("019283"),
                PrizeTier.FIRST, List.of("48192"),
                PrizeTier.SECOND, List.of("57391"),
                PrizeTier.THIRD, List.of("10284", "82947"),
                PrizeTier.FOURTH,
                    List.of("91827", "37465", "64829", "18273", "59182", "40192", "83746"),
                PrizeTier.FIFTH, List.of("1928"),
                PrizeTier.SIXTH, List.of("9283", "4710", "3829"),
                PrizeTier.SEVENTH, List.of("283"),
                PrizeTier.EIGHTH, List.of("83")));

    // Pre-populate DB with complete draws
    fakeDrawRepository.save(tphcm, "SEED");
    fakeDrawRepository.save(dongThap, "SEED");

    TrackingFakeResultSource trackingSource = new TrackingFakeResultSource();
    IngestDrawsUseCase cachingUseCase =
        new IngestDrawsUseCase(fakeSchedulePort, trackingSource, fakeDrawRepository);

    IngestDrawsUseCase.IngestSummary summary = cachingUseCase.ingestForDate(date);

    assertThat(summary.totalStations()).isEqualTo(2);
    assertThat(summary.alreadyExisted()).isEqualTo(2);
    assertThat(summary.newlySaved()).isEqualTo(0);
    assertThat(summary.failedOrUnavailable()).isEqualTo(0);

    // Assert that external source was NEVER called on rerun
    assertThat(trackingSource.callCount.get()).isEqualTo(0);
  }

  @Test
  @DisplayName(
      "Ghi nhận metrics ingest.success, ingest.failure và timer ingest.time chính xác (T04.19)")
  void recordsMetricsOnSuccessAndFailure() {
    SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();
    IngestDrawsUseCase metricsUseCase =
        new IngestDrawsUseCase(
            fakeSchedulePort, fakeResultSource, fakeDrawRepository, meterRegistry);

    LocalDate date = LocalDate.of(2026, 11, 2);
    fakeSchedulePort.setStations(List.of("tp-hcm", "dong-thap", "ca-mau"));

    DrawResult tphcm = new DrawResult("tp-hcm", date, Map.of(PrizeTier.SPECIAL, List.of("482915")));
    fakeResultSource.register(tphcm);
    // dong-thap throws exception or is unavailable, ca-mau is empty

    IngestDrawsUseCase.IngestSummary summary = metricsUseCase.ingestForDate(date);

    assertThat(summary.totalStations()).isEqualTo(3);
    assertThat(summary.newlySaved()).isEqualTo(1);
    assertThat(summary.failedOrUnavailable()).isEqualTo(2);

    // Verify Micrometer metrics
    double successCount = meterRegistry.counter("ingest.success").count();
    double failureCount = meterRegistry.counter("ingest.failure").count();
    long timerCount = meterRegistry.timer("ingest.time").count();

    assertThat(successCount).isEqualTo(1.0);
    assertThat(failureCount).isEqualTo(2.0);
    assertThat(timerCount).isEqualTo(3);
  }
}
