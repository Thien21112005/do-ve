package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

@DisplayName("Matcher Suffix Matching Helper")
class MatcherTest {

  @ParameterizedTest
  @CsvSource({
    "654321, 21, 2, true",
    "654321, 321, 3, true",
    "654321, 4321, 4, true",
    "654321, 54321, 5, true",
    "654321, 654321, 6, true",
    "654321, 22, 2, false",
    "654321, 421, 3, false",
    "654321, 99999, 5, false"
  })
  @DisplayName("khớp và không khớp các hậu tố độ dài khác nhau")
  void shouldMatchSuffixesCorrectly(
      String ticket, String prizeNumber, int digits, boolean expected) {
    assertThat(Matcher.suffixMatches(ticket, prizeNumber, digits)).isEqualTo(expected);
  }

  @Test
  @DisplayName("bảo toàn số 0 ở đầu khi so khớp hậu tố")
  void shouldPreserveLeadingZeros() {
    assertThat(Matcher.suffixMatches("012305", "05", 2)).isTrue();
    assertThat(Matcher.suffixMatches("012305", "15", 2)).isFalse();
    assertThat(Matcher.suffixMatches("000000", "00", 2)).isTrue();
    assertThat(Matcher.suffixMatches("000000", "000000", 6)).isTrue();
    assertThat(Matcher.suffixMatches("000001", "000000", 6)).isFalse();
  }

  @Test
  @DisplayName("xử lý các trường hợp biên: độ dài lệch, null, digits <= 0")
  void shouldHandleEdgeCasesSafely() {
    // Số ngắn hơn digits
    assertThat(Matcher.suffixMatches("1", "21", 2)).isFalse();
    assertThat(Matcher.suffixMatches("654321", "1", 2)).isFalse();

    // digits không hợp lệ
    assertThat(Matcher.suffixMatches("654321", "21", 0)).isFalse();
    assertThat(Matcher.suffixMatches("654321", "21", -1)).isFalse();

    // Giá trị null
    assertThat(Matcher.suffixMatches((String) null, "21", 2)).isFalse();
    assertThat(Matcher.suffixMatches("654321", null, 2)).isFalse();
    assertThat(Matcher.suffixMatches((TicketNumber) null, "21", 2)).isFalse();
  }

  @Test
  @DisplayName("hoạt động chuẩn với đối tượng TicketNumber")
  void shouldWorkWithTicketNumberValueObject() {
    TicketNumber ticket = new TicketNumber("654321");
    assertThat(Matcher.suffixMatches(ticket, "21", 2)).isTrue();
    assertThat(Matcher.suffixMatches(ticket, "99", 2)).isFalse();
  }
}
