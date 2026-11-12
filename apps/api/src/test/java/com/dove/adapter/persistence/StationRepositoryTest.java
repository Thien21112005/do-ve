package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class StationRepositoryTest {

  @Autowired private StationRepository stationRepository;

  @Test
  @DisplayName("Lưu và tìm đài theo mã slug 'tp-hcm'")
  void shouldSaveAndFindByCode() {
    StationEntity station = new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH");
    stationRepository.save(station);

    Optional<StationEntity> found = stationRepository.findByCode("tp-hcm");

    assertThat(found).isPresent();
    assertThat(found.get().getCode()).isEqualTo("tp-hcm");
    assertThat(found.get().getName()).isEqualTo("TP. Hồ Chí Minh");
    assertThat(found.get().getRegion()).isEqualTo("SOUTH");
    assertThat(found.get().getId()).isNotNull();
    assertThat(found.get().getCreatedAt()).isNotNull();
  }

  @Test
  @DisplayName("Tìm đài không tồn tại trả về Optional rỗng")
  void shouldReturnEmptyWhenStationNotFound() {
    Optional<StationEntity> found = stationRepository.findByCode("unknown-station");
    assertThat(found).isEmpty();
  }
}
