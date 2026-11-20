package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.PrizeTier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

@DisplayName("T13.06 - Prize tier labels are matched by whole token")
class PrizeTierLabelTest {

  private final XsktHtmlParser parser = new XsktHtmlParser();

  @ParameterizedTest(name = "\"{0}\" -> {1}")
  @CsvSource({
    "Giải đặc biệt, SPECIAL",
    "Đặc biệt, SPECIAL",
    "ĐB, SPECIAL",
    "G.ĐB, SPECIAL",
    "Giải nhất, FIRST",
    "Giải nhì, SECOND",
    "Giải ba, THIRD",
    "Giải tư, FOURTH",
    "Giải năm, FIFTH",
    "Giải sáu, SIXTH",
    "Giải bảy, SEVENTH",
    "Giải tám, EIGHTH",
    "G.1, FIRST",
    "G1, FIRST",
    "G 3, THIRD",
    "G.7, SEVENTH",
    "G.8, EIGHTH",
  })
  void resolvesEveryLabel(String label, PrizeTier expected) {
    assertThat(parser.resolvePrizeTier(label, "")).isEqualTo(expected);
  }

  @ParameterizedTest(name = "class \"{0}\" -> {1}")
  @CsvSource({"gdb, SPECIAL", "g1, FIRST", "g7, SEVENTH", "g8, EIGHTH", "row g3, THIRD"})
  void resolvesRowClasses(String rowClass, PrizeTier expected) {
    assertThat(parser.resolvePrizeTier("", rowClass)).isEqualTo(expected);
  }

  @Test
  @DisplayName("Text that only contains a tier word as a substring is not a prize row")
  void ignoresSubstringLookalikes() {
    assertThat(parser.resolvePrizeTier("Thống kê lô tô", "")).isNull();
    assertThat(parser.resolvePrizeTier("Xổ số Bà Rịa", "")).isNull();
    assertThat(parser.resolvePrizeTier("Thứ Năm", "")).isNull();
    assertThat(parser.resolvePrizeTier("", "g10")).isNull();
  }
}
