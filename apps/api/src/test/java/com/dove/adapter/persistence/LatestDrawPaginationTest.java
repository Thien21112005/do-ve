package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * T13.09 - "latest draw" queries must limit rows in SQL. With collection fetch joins, Hibernate
 * would otherwise load every draw and paginate in memory (HHH90003004); this flag turns that into an
 * error.
 */
@DataJpaTest(
    properties =
        "spring.jpa.properties.hibernate.query.fail_on_pagination_over_collection_fetch=true")
@ActiveProfiles("test")
@Import(JpaDrawRepositoryAdapter.class)
@DisplayName("T13.09 - Latest draw lookups never paginate in memory")
class LatestDrawPaginationTest {

  @Autowired private StationRepository stationRepository;
  @Autowired private DrawResultRepository drawResultRepository;
  @Autowired private JpaDrawRepositoryAdapter adapter;

  @BeforeEach
  void seed() {
    StationEntity hcm = stationRepository.save(new StationEntity("tp-hcm", "TP. HCM", "SOUTH"));
    StationEntity ca = stationRepository.save(new StationEntity("ca-mau", "Cà Mau", "SOUTH"));
    for (int day = 1; day <= 9; day++) {
      for (StationEntity s : new StationEntity[] {hcm, ca}) {
        if (s == ca && day == 9) {
          continue; // ca-mau's latest is the 8th, tp-hcm's the 9th
        }
        DrawResultEntity d = new DrawResultEntity(s, LocalDate.of(2026, 11, day), "SCRAPER");
        d.addPrizeNumber(new PrizeNumberEntity("SPECIAL", 0, String.format("0%05d", day)));
        d.addPrizeNumber(new PrizeNumberEntity("EIGHTH", 0, "1" + day));
        drawResultRepository.save(d);
      }
    }
    drawResultRepository.flush();
  }

  @Test
  @DisplayName("latest by station returns that station's newest draw with all its numbers")
  void latestByStation() {
    DrawResult latest = adapter.findLatestByStation("ca-mau").orElseThrow();

    assertThat(latest.drawDate()).isEqualTo(LocalDate.of(2026, 11, 8));
    assertThat(latest.getSpecialNumber()).contains("000008");
    assertThat(latest.numbers().values().stream().mapToInt(java.util.List::size).sum())
        .isEqualTo(2);
  }

  @Test
  @DisplayName("latest overall returns the newest draw date")
  void latestOverall() {
    DrawResult latest = adapter.findLatestOverall().orElseThrow();

    assertThat(latest.drawDate()).isEqualTo(LocalDate.of(2026, 11, 9));
    assertThat(latest.stationCode()).isEqualTo("tp-hcm");
  }

  @Test
  @DisplayName("unknown station has no latest draw")
  void unknownStation() {
    assertThat(adapter.findLatestByStation("khong-co")).isEmpty();
  }
}
