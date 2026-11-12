package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class StationScheduleRepositoryTest {

  @Autowired private StationRepository stationRepository;

  @Autowired private StationScheduleRepository stationScheduleRepository;

  @Test
  @DisplayName("Thứ 7 (weekday = 6) có đúng 4 đài quay: tp-hcm, long-an, hau-giang, binh-phuoc")
  void shouldReturnFourStationsOnSaturday() {
    StationEntity hcm =
        stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));
    StationEntity longAn = stationRepository.save(new StationEntity("long-an", "Long An", "SOUTH"));
    StationEntity hauGiang =
        stationRepository.save(new StationEntity("hau-giang", "Hậu Giang", "SOUTH"));
    StationEntity binhPhuoc =
        stationRepository.save(new StationEntity("binh-phuoc", "Bình Phước", "SOUTH"));

    // Lưu đài khác vào thứ 2 (weekday = 1) để đảm bảo không bị lẫn
    StationEntity dongThap =
        stationRepository.save(new StationEntity("dong-thap", "Đồng Tháp", "SOUTH"));
    stationScheduleRepository.save(new StationScheduleEntity(dongThap, 1));

    // Lưu 4 đài thứ 7
    stationScheduleRepository.save(new StationScheduleEntity(hcm, 6));
    stationScheduleRepository.save(new StationScheduleEntity(longAn, 6));
    stationScheduleRepository.save(new StationScheduleEntity(hauGiang, 6));
    stationScheduleRepository.save(new StationScheduleEntity(binhPhuoc, 6));

    List<StationEntity> saturdayStations = stationScheduleRepository.findStationsDrawingOn(6);

    assertThat(saturdayStations).hasSize(4);
    assertThat(saturdayStations)
        .extracting(StationEntity::getCode)
        .containsExactlyInAnyOrder("tp-hcm", "long-an", "hau-giang", "binh-phuoc");
  }
}
