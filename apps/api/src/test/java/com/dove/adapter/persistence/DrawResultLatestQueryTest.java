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
class DrawResultLatestQueryTest {

  @Autowired private StationRepository stationRepository;

  @Autowired private DrawResultRepository drawResultRepository;

  @Test
  @DisplayName("findLatestByStationCode trả về kỳ quay có ngày lớn nhất của đài đó")
  void shouldFindLatestByStationCode() {
    StationEntity hcm =
        stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));

    DrawResultEntity olderDraw = new DrawResultEntity(hcm, LocalDate.of(2026, 11, 2), "SCRAPER");
    olderDraw.addPrizeNumber(new PrizeNumberEntity("SPECIAL", 0, "111111"));
    drawResultRepository.save(olderDraw);

    DrawResultEntity newerDraw = new DrawResultEntity(hcm, LocalDate.of(2026, 11, 9), "SCRAPER");
    newerDraw.addPrizeNumber(new PrizeNumberEntity("SPECIAL", 0, "222222"));
    drawResultRepository.save(newerDraw);

    Optional<DrawResultEntity> latest = drawResultRepository.findLatestByStationCode("tp-hcm");

    assertThat(latest).isPresent();
    assertThat(latest.get().getDrawDate()).isEqualTo(LocalDate.of(2026, 11, 9));
    assertThat(latest.get().getPrizeNumbers().get(0).getNumber()).isEqualTo("222222");
  }

  @Test
  @DisplayName("findLatestOverall trả về kỳ quay có ngày lớn nhất trên toàn hệ thống")
  void shouldFindLatestOverall() {
    StationEntity hcm =
        stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));
    StationEntity dongThap =
        stationRepository.save(new StationEntity("dong-thap", "Đồng Tháp", "SOUTH"));

    drawResultRepository.save(new DrawResultEntity(hcm, LocalDate.of(2026, 11, 2), "SCRAPER"));
    drawResultRepository.save(
        new DrawResultEntity(dongThap, LocalDate.of(2026, 11, 10), "SCRAPER"));

    Optional<DrawResultEntity> latest = drawResultRepository.findLatestOverall();

    assertThat(latest).isPresent();
    assertThat(latest.get().getStation().getCode()).isEqualTo("dong-thap");
    assertThat(latest.get().getDrawDate()).isEqualTo(LocalDate.of(2026, 11, 10));
  }
}
