package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PrizeTable Mapping")
class PrizeTableTest {

  @Test
  @DisplayName("bảng giải mặc định miền Nam trả đúng số tiền cho cả 11 giải theo bảng 3.1 SRS")
  void shouldReturnCorrectAmountsForSouthernDefault() {
    PrizeTable table = PrizeTable.southDefault();

    assertThat(table.getPrizeMoney(PrizeTier.SPECIAL)).isEqualTo(Money.of(2_000_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.FIRST)).isEqualTo(Money.of(30_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.SECOND)).isEqualTo(Money.of(15_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.THIRD)).isEqualTo(Money.of(10_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.FOURTH)).isEqualTo(Money.of(3_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.FIFTH)).isEqualTo(Money.of(1_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.SIXTH)).isEqualTo(Money.of(400_000L));
    assertThat(table.getPrizeMoney(PrizeTier.SEVENTH)).isEqualTo(Money.of(200_000L));
    assertThat(table.getPrizeMoney(PrizeTier.EIGHTH)).isEqualTo(Money.of(100_000L));
    assertThat(table.getPrizeMoney(PrizeTier.SPECIAL_CONSOLATION)).isEqualTo(Money.of(50_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.ENCOURAGEMENT)).isEqualTo(Money.of(6_000_000L));
  }

  @Test
  @DisplayName("bảo vệ bất biến: không thể sửa map giải thưởng")
  void shouldBeImmutable() {
    PrizeTable table = PrizeTable.southDefault();
    assertThatThrownBy(() -> table.asMap().put(PrizeTier.EIGHTH, Money.of(999)))
        .isInstanceOf(UnsupportedOperationException.class);
  }

  @Test
  @DisplayName("trả Money.ZERO khi giải không được cấu hình trong bảng")
  void shouldReturnZeroForUnconfiguredTier() {
    PrizeTable sparseTable = new PrizeTable(Map.of(PrizeTier.EIGHTH, Money.of(100_000L)));
    assertThat(sparseTable.getPrizeMoney(PrizeTier.SPECIAL)).isEqualTo(Money.ZERO);
    assertThat(sparseTable.getPrizeMoney(PrizeTier.EIGHTH)).isEqualTo(Money.of(100_000L));
  }
}
