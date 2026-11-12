package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DrawResult Structure Validation")
class DrawResultValidationTest {

  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);
  private static final String TEST_STATION = "tp-hcm";

  /** Tạo một kỳ quay đầy đủ chuẩn 18 số miền Nam. */
  private static Map<PrizeTier, List<String>> createStandardValidNumbers() {
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    map.put(PrizeTier.SPECIAL, List.of("654321")); // 1 số x 6 ký tự
    map.put(PrizeTier.FIRST, List.of("12345")); // 1 số x 5 ký tự
    map.put(PrizeTier.SECOND, List.of("23456")); // 1 số x 5 ký tự
    map.put(PrizeTier.THIRD, List.of("34567", "45678")); // 2 số x 5 ký tự
    map.put(
        PrizeTier.FOURTH,
        List.of("56789", "67890", "78901", "89012", "90123", "01234", "12340")); // 7 số x 5 ký tự
    map.put(PrizeTier.FIFTH, List.of("2345")); // 1 số x 4 ký tự
    map.put(PrizeTier.SIXTH, List.of("3456", "4567", "5678")); // 3 số x 4 ký tự
    map.put(PrizeTier.SEVENTH, List.of("321")); // 1 số x 3 ký tự
    map.put(PrizeTier.EIGHTH, List.of("21")); // 1 số x 2 ký tự
    return map;
  }

  @Test
  @DisplayName("hợp lệ khi đủ 18 số và đúng độ dài từng giải")
  void shouldPassValidationForCompleteDraw() {
    DrawResult drawResult = new DrawResult(TEST_STATION, TEST_DATE, createStandardValidNumbers());

    assertThatCode(drawResult::validate).doesNotThrowAnyException();
    assertThat(drawResult.isComplete()).isTrue();
  }

  @Test
  @DisplayName("từ chối khi thiếu 1 số của giải Tư (chỉ có 6 số thay vì 7 số)")
  void shouldRejectMissingNumberInFourthTier() {
    Map<PrizeTier, List<String>> numbers = createStandardValidNumbers();
    numbers.put(
        PrizeTier.FOURTH,
        List.of("56789", "67890", "78901", "89012", "90123", "01234")); // thiếu 1 số

    DrawResult drawResult = new DrawResult(TEST_STATION, TEST_DATE, numbers);

    assertThatThrownBy(drawResult::validate)
        .isInstanceOf(InvalidDrawResultException.class)
        .hasMessageContaining("Giải tư yêu cầu đúng 7 số");
    assertThat(drawResult.isComplete()).isFalse();
  }

  @Test
  @DisplayName("từ chối khi sai độ dài của giải Tám (3 số thay vì 2 số)")
  void shouldRejectWrongDigitCountInEighthTier() {
    Map<PrizeTier, List<String>> numbers = createStandardValidNumbers();
    numbers.put(PrizeTier.EIGHTH, List.of("321")); // G8 phải có 2 số

    DrawResult drawResult = new DrawResult(TEST_STATION, TEST_DATE, numbers);

    assertThatThrownBy(drawResult::validate)
        .isInstanceOf(InvalidDrawResultException.class)
        .hasMessageContaining("Số trúng 321 của giải Giải tám không hợp lệ");
    assertThat(drawResult.isComplete()).isFalse();
  }

  @Test
  @DisplayName("từ chối khi số trúng chứa ký tự chữ")
  void shouldRejectNonDigitCharacters() {
    Map<PrizeTier, List<String>> numbers = createStandardValidNumbers();
    numbers.put(PrizeTier.FIRST, List.of("12A45"));

    DrawResult drawResult = new DrawResult(TEST_STATION, TEST_DATE, numbers);

    assertThatThrownBy(drawResult::validate)
        .isInstanceOf(InvalidDrawResultException.class)
        .hasMessageContaining("không hợp lệ (phải đúng 5 chữ số)");
    assertThat(drawResult.isComplete()).isFalse();
  }

  @Test
  @DisplayName("từ chối khi chứa giải suy diễn (SPECIAL_CONSOLATION) trong kết quả bốc thăm")
  void shouldRejectDerivedTierInDrawResult() {
    Map<PrizeTier, List<String>> numbers = createStandardValidNumbers();
    numbers.put(PrizeTier.SPECIAL_CONSOLATION, List.of("054321"));

    DrawResult drawResult = new DrawResult(TEST_STATION, TEST_DATE, numbers);

    assertThatThrownBy(drawResult::validate)
        .isInstanceOf(InvalidDrawResultException.class)
        .hasMessageContaining("Kỳ quay không được chứa giải suy diễn");
    assertThat(drawResult.isComplete()).isFalse();
  }

  @Test
  @DisplayName("từ chối khi kỳ quay trống hoàn toàn hoặc thiếu giải")
  void shouldRejectEmptyOrMissingTiers() {
    DrawResult emptyResult = new DrawResult(TEST_STATION, TEST_DATE, Map.of());

    assertThatThrownBy(emptyResult::validate).isInstanceOf(InvalidDrawResultException.class);
    assertThat(emptyResult.isComplete()).isFalse();
  }
}
