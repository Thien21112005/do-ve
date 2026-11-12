package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class DrawResultQueryByStationAndDateTest {

  @Autowired private StationRepository stationRepository;

  @Autowired private DrawResultRepository drawResultRepository;

  private StationEntity hcmStation;
  private final LocalDate drawDate = LocalDate.of(2026, 11, 2);

  @BeforeEach
  void setUp() {
    hcmStation = stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));

    DrawResultEntity draw = new DrawResultEntity(hcmStation, drawDate, "SCRAPER");
    draw.addPrizeNumber(new PrizeNumberEntity("SPECIAL", 0, "654321"));
    draw.addPrizeNumber(new PrizeNumberEntity("FIRST", 0, "12345"));
    drawResultRepository.save(draw);
  }

  @Test
  @DisplayName("Tìm thấy kỳ quay theo đúng mã đài và ngày")
  void shouldFindDrawByStationAndDate() {
    Optional<DrawResultEntity> result =
        drawResultRepository.findByStationCodeAndDrawDate("tp-hcm", drawDate);

    assertThat(result).isPresent();
    assertThat(result.get().getStation().getCode()).isEqualTo("tp-hcm");
    assertThat(result.get().getDrawDate()).isEqualTo(drawDate);
    assertThat(result.get().getPrizeNumbers()).hasSize(2);
  }

  @Test
  @DisplayName("Trả về Optional rỗng khi ngày không có kỳ quay")
  void shouldReturnEmptyWhenDateHasNoDraw() {
    Optional<DrawResultEntity> result =
        drawResultRepository.findByStationCodeAndDrawDate("tp-hcm", LocalDate.of(2026, 11, 3));

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Trả về Optional rỗng khi mã đài không tồn tại")
  void shouldReturnEmptyWhenStationDoesNotExist() {
    Optional<DrawResultEntity> result =
        drawResultRepository.findByStationCodeAndDrawDate("unknown-station", drawDate);

    assertThat(result).isEmpty();
  }
}
