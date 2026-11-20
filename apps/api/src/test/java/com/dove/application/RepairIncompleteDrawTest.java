package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T13.08 - Re-ingest repairs an incomplete stored draw")
class RepairIncompleteDrawTest {

  private static final LocalDate DATE = LocalDate.of(2026, 11, 17);
  private static final StationSchedulePort SCHEDULE = date -> List.of("ben-tre");

  private static Map<PrizeTier, List<String>> fullNumbers(String special) {
    Map<PrizeTier, List<String>> n = new EnumMap<>(PrizeTier.class);
    n.put(PrizeTier.EIGHTH, List.of("12"));
    n.put(PrizeTier.SEVENTH, List.of("123"));
    n.put(PrizeTier.SIXTH, List.of("1234", "2345", "3456"));
    n.put(PrizeTier.FIFTH, List.of("4567"));
    n.put(PrizeTier.FOURTH, List.of("10001", "10002", "10003", "10004", "10005", "10006", "10007"));
    n.put(PrizeTier.THIRD, List.of("20001", "20002"));
    n.put(PrizeTier.SECOND, List.of("30001"));
    n.put(PrizeTier.FIRST, List.of("40001"));
    n.put(PrizeTier.SPECIAL, List.of(special));
    return n;
  }

  /** Repository that records which source wrote each draw. */
  static class RecordingRepository extends OnDemandDrawBackfillServiceTest.InMemoryDrawRepository {
    final AtomicReference<String> lastSource = new AtomicReference<>();

    @Override
    public DrawResult save(DrawResult drawResult, String source) {
      lastSource.set(source);
      return super.save(drawResult, source);
    }
  }

  @Test
  @DisplayName("Stored draw with only 10 numbers is replaced by the complete scraped draw")
  void repairsIncompleteDraw() {
    RecordingRepository repo = new RecordingRepository();
    Map<PrizeTier, List<String>> partial = new EnumMap<>(fullNumbers("054321"));
    partial.remove(PrizeTier.FOURTH);
    partial.remove(PrizeTier.SIXTH);
    repo.save(new DrawResult("ben-tre", DATE, partial), "SCRAPER");
    assertThat(repo.findByStationAndDate("ben-tre", DATE).orElseThrow().isComplete()).isFalse();

    ResultSource source = (s, d) -> Optional.of(new DrawResult(s, d, fullNumbers("054321")));
    IngestDrawsUseCase.IngestSummary summary =
        new IngestDrawsUseCase(SCHEDULE, source, repo).ingestForDate(DATE);

    DrawResult stored = repo.findByStationAndDate("ben-tre", DATE).orElseThrow();
    assertThat(stored.isComplete()).isTrue();
    assertThat(stored.getSpecialNumber()).contains("054321");
    assertThat(summary.newlySaved()).isEqualTo(1);
    assertThat(summary.alreadyExisted()).isZero();
  }

  @Test
  @DisplayName("A complete stored draw (e.g. ADMIN_MANUAL) is never overwritten by the scraper")
  void neverOverwritesCompleteDraw() {
    RecordingRepository repo = new RecordingRepository();
    repo.save(new DrawResult("ben-tre", DATE, fullNumbers("111111")), "ADMIN_MANUAL");
    ResultSource source = (s, d) -> Optional.of(new DrawResult(s, d, fullNumbers("999999")));

    new IngestDrawsUseCase(SCHEDULE, source, repo).ingestForDate(DATE);

    assertThat(repo.findByStationAndDate("ben-tre", DATE).orElseThrow().getSpecialNumber())
        .contains("111111");
    assertThat(repo.lastSource.get()).isEqualTo("ADMIN_MANUAL");
  }

  @Test
  @DisplayName("An incomplete scraped draw never replaces the stored one")
  void ignoresIncompleteScrape() {
    RecordingRepository repo = new RecordingRepository();
    Map<PrizeTier, List<String>> partial = new EnumMap<>(fullNumbers("054321"));
    partial.remove(PrizeTier.FOURTH);
    repo.save(new DrawResult("ben-tre", DATE, partial), "SCRAPER");
    Map<PrizeTier, List<String>> worse = new EnumMap<>(partial);
    worse.remove(PrizeTier.THIRD);
    ResultSource source = (s, d) -> Optional.of(new DrawResult(s, d, worse));

    new IngestDrawsUseCase(SCHEDULE, source, repo).ingestForDate(DATE);

    assertThat(repo.findByStationAndDate("ben-tre", DATE).orElseThrow().getNumbers(PrizeTier.THIRD))
        .hasSize(2);
  }
}
