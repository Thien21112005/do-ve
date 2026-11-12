package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DrawResultMapperTest {

  @Test
  @DisplayName("Round-trip mapping giữa DrawResult và DrawResultEntity không làm mất dữ liệu")
  void shouldPreserveDataOnRoundTrip() {
    Map<PrizeTier, List<String>> numbers =
        Map.of(
            PrizeTier.SPECIAL, List.of("054321"), // Số có số 0 đầu
            PrizeTier.FIRST, List.of("09876"),
            PrizeTier.SECOND, List.of("12345"),
            PrizeTier.THIRD, List.of("22222", "33333"),
            PrizeTier.FOURTH,
                List.of("44444", "55555", "66666", "77777", "88888", "12345", "23456"),
            PrizeTier.FIFTH, List.of("0234"),
            PrizeTier.SIXTH, List.of("0345", "3456", "4567"),
            PrizeTier.SEVENTH, List.of("021"),
            PrizeTier.EIGHTH, List.of("05"));

    DrawResult original = new DrawResult("tp-hcm", LocalDate.of(2026, 11, 2), numbers);
    StationEntity station = new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH");

    DrawResultEntity entity = DrawResultMapper.toEntity(original, station, "TEST_SUITE");

    assertThat(entity.getStation().getCode()).isEqualTo("tp-hcm");
    assertThat(entity.getDrawDate()).isEqualTo(LocalDate.of(2026, 11, 2));
    assertThat(entity.getSource()).isEqualTo("TEST_SUITE");
    assertThat(entity.getPrizeNumbers()).hasSize(18);

    DrawResult restored = DrawResultMapper.toDomain(entity);

    assertThat(restored.stationCode()).isEqualTo(original.stationCode());
    assertThat(restored.drawDate()).isEqualTo(original.drawDate());
    assertThat(restored.numbers()).isEqualTo(original.numbers());

    // Kiểm tra bảo toàn số 0 đầu
    assertThat(restored.getNumbers(PrizeTier.SPECIAL)).containsExactly("054321");
    assertThat(restored.getNumbers(PrizeTier.EIGHTH)).containsExactly("05");
    assertThat(restored.getNumbers(PrizeTier.SEVENTH)).containsExactly("021");

    // Kiểm tra thứ tự các số trong giải tư
    assertThat(restored.getNumbers(PrizeTier.FOURTH))
        .containsExactly("44444", "55555", "66666", "77777", "88888", "12345", "23456");
  }
}
