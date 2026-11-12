package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class DrawResultEntityTest {

  @Autowired private StationRepository stationRepository;

  @Autowired private DrawResultRepository drawResultRepository;

  @Test
  @DisplayName("Lưu 1 DrawResultEntity kéo theo lưu cascade các số trúng")
  void shouldCascadeSavePrizeNumbers() {
    StationEntity station =
        stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));

    DrawResultEntity draw = new DrawResultEntity(station, LocalDate.of(2026, 11, 2), "SCRAPER");
    draw.addPrizeNumber(new PrizeNumberEntity("SPECIAL", 0, "654321"));
    draw.addPrizeNumber(new PrizeNumberEntity("FIRST", 0, "99999"));
    draw.addPrizeNumber(new PrizeNumberEntity("EIGHTH", 0, "15"));

    DrawResultEntity saved = drawResultRepository.save(draw);

    assertThat(saved.getId()).isNotNull();
    assertThat(saved.getPrizeNumbers()).hasSize(3);

    Optional<DrawResultEntity> found =
        drawResultRepository.findByStationCodeAndDrawDate("tp-hcm", LocalDate.of(2026, 11, 2));

    assertThat(found).isPresent();
    assertThat(found.get().getStation().getCode()).isEqualTo("tp-hcm");
    assertThat(found.get().getPrizeNumbers()).hasSize(3);
    assertThat(found.get().getPrizeNumbers().get(0).getNumber()).isEqualTo("654321");
  }
}
