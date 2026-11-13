package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("IngestDrawsUseCase Orchestration Specification (T04.13)")
class IngestDrawsUseCaseTest {

  private InMemoryDrawRepository fakeDrawRepository;
  private FakeStationSchedulePort fakeSchedulePort;
  private ResultSourceTest.FakeResultSource fakeResultSource;
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

  @BeforeEach
  void setUp() {
    fakeDrawRepository = new InMemoryDrawRepository();
    fakeSchedulePort = new FakeStationSchedulePort();
    fakeResultSource = new ResultSourceTest.FakeResultSource();
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
    // ca-mau not registered -> simulated not available yet

    IngestDrawsUseCase.IngestSummary summary = useCase.ingestForDate(date);

    assertThat(summary.totalStations()).isEqualTo(3);
    assertThat(summary.newlySaved()).isEqualTo(2);
    assertThat(summary.alreadyExisted()).isEqualTo(0);
    assertThat(summary.failedOrUnavailable()).isEqualTo(1);

    assertThat(fakeDrawRepository.findByStationAndDate("tp-hcm", date)).contains(tphcm);
    assertThat(fakeDrawRepository.findByStationAndDate("dong-thap", date)).contains(dongThap);
    assertThat(fakeDrawRepository.findByStationAndDate("ca-mau", date)).isEmpty();

    // Re-run same day: should report alreadyExisted
    IngestDrawsUseCase.IngestSummary rerunSummary = useCase.ingestForDate(date);
    assertThat(rerunSummary.newlySaved()).isEqualTo(0);
    assertThat(rerunSummary.alreadyExisted()).isEqualTo(2);
    assertThat(rerunSummary.failedOrUnavailable()).isEqualTo(1);
  }
}
