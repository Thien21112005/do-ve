package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PrizeTier Enum")
class PrizeTierTest {

  @Test
  @DisplayName("khớp 11 tier theo quy định cơ cấu giải miền Nam")
  void shouldHaveAllElevenTiers() {
    assertThat(PrizeTier.values())
        .containsExactly(
            PrizeTier.SPECIAL,
            PrizeTier.FIRST,
            PrizeTier.SECOND,
            PrizeTier.THIRD,
            PrizeTier.FOURTH,
            PrizeTier.FIFTH,
            PrizeTier.SIXTH,
            PrizeTier.SEVENTH,
            PrizeTier.EIGHTH,
            PrizeTier.SPECIAL_CONSOLATION,
            PrizeTier.ENCOURAGEMENT);
  }

  @Test
  @DisplayName("tổng số lượng số bốc thăm của 9 giải thường đúng bằng 18 số")
  void shouldSumTo18DrawnNumbers() {
    int totalDrawn =
        Arrays.stream(PrizeTier.values())
            .filter(PrizeTier::isDrawn)
            .mapToInt(PrizeTier::drawCount)
            .sum();

    assertThat(totalDrawn).isEqualTo(18);
  }

  @Test
  @DisplayName("số chữ số của từng giải khớp bảng 3.1 SRS")
  void shouldMatchDigitsPerSRS() {
    assertThat(PrizeTier.SPECIAL.digits()).isEqualTo(6);
    assertThat(PrizeTier.FIRST.digits()).isEqualTo(5);
    assertThat(PrizeTier.SECOND.digits()).isEqualTo(5);
    assertThat(PrizeTier.THIRD.digits()).isEqualTo(5);
    assertThat(PrizeTier.FOURTH.digits()).isEqualTo(5);
    assertThat(PrizeTier.FIFTH.digits()).isEqualTo(4);
    assertThat(PrizeTier.SIXTH.digits()).isEqualTo(4);
    assertThat(PrizeTier.SEVENTH.digits()).isEqualTo(3);
    assertThat(PrizeTier.EIGHTH.digits()).isEqualTo(2);

    assertThat(PrizeTier.SPECIAL_CONSOLATION.digits()).isEqualTo(6);
    assertThat(PrizeTier.ENCOURAGEMENT.digits()).isEqualTo(6);

    assertThat(PrizeTier.SPECIAL_CONSOLATION.isDerived()).isTrue();
    assertThat(PrizeTier.ENCOURAGEMENT.isDerived()).isTrue();
  }
}
