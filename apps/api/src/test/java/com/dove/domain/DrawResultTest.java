package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DrawResult Model Immutability")
class DrawResultTest {

  @Test
  @DisplayName("bảo vệ bất biến: không thể sửa map kết quả sau khi tạo")
  void shouldBeImmutableMap() {
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    List<String> special = new ArrayList<>(List.of("654321"));
    map.put(PrizeTier.SPECIAL, special);

    DrawResult drawResult = new DrawResult("tp-hcm", LocalDate.of(2026, 11, 12), map);

    // Không sửa được map gốc từ getter
    assertThatThrownBy(() -> drawResult.numbers().put(PrizeTier.FIRST, List.of("12345")))
        .isInstanceOf(UnsupportedOperationException.class);

    // Không sửa được list số trúng từ getter
    assertThatThrownBy(() -> drawResult.getNumbers(PrizeTier.SPECIAL).add("999999"))
        .isInstanceOf(UnsupportedOperationException.class);

    // Sửa map hoặc list nguồn truyền vào không ảnh hưởng DrawResult
    map.put(PrizeTier.EIGHTH, List.of("21"));
    special.add("000000");

    assertThat(drawResult.numbers()).doesNotContainKey(PrizeTier.EIGHTH);
    assertThat(drawResult.getNumbers(PrizeTier.SPECIAL)).containsExactly("654321");
  }

  @Test
  @DisplayName("từ chối khi stationCode null hoặc rỗng, hoặc drawDate null")
  void shouldRejectNullOrBlankIdentifiers() {
    LocalDate today = LocalDate.of(2026, 11, 12);
    Map<PrizeTier, List<String>> emptyMap = Map.of();

    assertThatThrownBy(() -> new DrawResult(null, today, emptyMap))
        .isInstanceOf(NullPointerException.class);

    assertThatThrownBy(() -> new DrawResult("   ", today, emptyMap))
        .isInstanceOf(IllegalArgumentException.class);

    assertThatThrownBy(() -> new DrawResult("tp-hcm", null, emptyMap))
        .isInstanceOf(NullPointerException.class);
  }

  @Test
  @DisplayName("trả Optional empty khi không có giải đặc biệt")
  void shouldReturnEmptySpecialWhenMissing() {
    DrawResult drawResult = new DrawResult("tp-hcm", LocalDate.of(2026, 11, 12), Map.of());
    assertThat(drawResult.getSpecialNumber()).isEmpty();
    assertThat(drawResult.getNumbers(PrizeTier.FIRST)).isEmpty();
  }
}
