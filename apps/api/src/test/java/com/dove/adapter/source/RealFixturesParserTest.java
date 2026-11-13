package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Real HTML Fixtures End-to-End Parser Verification (T04.09)")
class RealFixturesParserTest {

  private final XsktHtmlParser parser = new XsktHtmlParser();

  private String loadHtml(String filename) throws Exception {
    try (InputStream is = getClass().getResourceAsStream("/html/" + filename)) {
      assertThat(is).as("HTML fixture /html/" + filename + " must exist").isNotNull();
      return new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  @Test
  @DisplayName("Fixture 1: Monday draw (2026-11-02) matches real reference JSON fixtures")
  void testMondayFixtureMatchesReferenceJson() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-02.html");
    List<DrawResult> results = parser.parseAll(html);

    assertThat(results).hasSize(3);

    // 1. TP.HCM
    DrawResult tphcm =
        results.stream().filter(r -> r.stationCode().equals("tp-hcm")).findFirst().orElseThrow();
    assertThat(tphcm.drawDate()).isEqualTo(LocalDate.of(2026, 11, 2));
    assertThat(tphcm.isComplete()).isTrue();
    assertThat(tphcm.getNumbers(PrizeTier.SPECIAL)).containsExactly("482915");
    assertThat(tphcm.getNumbers(PrizeTier.FIRST)).containsExactly("73924");
    assertThat(tphcm.getNumbers(PrizeTier.SECOND)).containsExactly("81057");
    assertThat(tphcm.getNumbers(PrizeTier.THIRD)).containsExactly("62481", "90135");
    assertThat(tphcm.getNumbers(PrizeTier.FOURTH))
        .containsExactly("17523", "49182", "30819", "65471", "82934", "10283", "74659");
    assertThat(tphcm.getNumbers(PrizeTier.FIFTH)).containsExactly("5928");
    assertThat(tphcm.getNumbers(PrizeTier.SIXTH)).containsExactly("8192", "3048", "6721");
    assertThat(tphcm.getNumbers(PrizeTier.SEVENTH)).containsExactly("395");
    assertThat(tphcm.getNumbers(PrizeTier.EIGHTH)).containsExactly("15");

    // 2. Đồng Tháp (leading zero preserved)
    DrawResult dongThap =
        results.stream().filter(r -> r.stationCode().equals("dong-thap")).findFirst().orElseThrow();
    assertThat(dongThap.drawDate()).isEqualTo(LocalDate.of(2026, 11, 2));
    assertThat(dongThap.isComplete()).isTrue();
    assertThat(dongThap.getNumbers(PrizeTier.SPECIAL)).containsExactly("019283");
    assertThat(dongThap.getNumbers(PrizeTier.FIRST)).containsExactly("48192");
    assertThat(dongThap.getNumbers(PrizeTier.SECOND)).containsExactly("57391");
    assertThat(dongThap.getNumbers(PrizeTier.THIRD)).containsExactly("10284", "82947");
    assertThat(dongThap.getNumbers(PrizeTier.EIGHTH)).containsExactly("83");

    // 3. Cà Mau
    DrawResult caMau =
        results.stream().filter(r -> r.stationCode().equals("ca-mau")).findFirst().orElseThrow();
    assertThat(caMau.drawDate()).isEqualTo(LocalDate.of(2026, 11, 2));
    assertThat(caMau.isComplete()).isTrue();
    assertThat(caMau.getNumbers(PrizeTier.SPECIAL)).containsExactly("928174");
    assertThat(caMau.getNumbers(PrizeTier.FIRST)).containsExactly("28391");
    assertThat(caMau.getNumbers(PrizeTier.SECOND)).containsExactly("74920");
    assertThat(caMau.getNumbers(PrizeTier.EIGHTH)).containsExactly("74");
  }

  @Test
  @DisplayName("Fixture 2: Tuesday draw (2026-11-03) extracts all 3 stations with 18 numbers each")
  void testTuesdayFixtureAllStations() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-03.html");
    List<DrawResult> results = parser.parseAll(html);

    assertThat(results).hasSize(3);

    Map<String, String> expectedSpecials =
        Map.of(
            "ben-tre", "395128",
            "vung-tau", "847291",
            "bac-lieu", "192837");

    for (DrawResult draw : results) {
      assertThat(draw.drawDate()).isEqualTo(LocalDate.of(2026, 11, 3));
      assertThat(draw.isComplete()).isTrue();
      assertThat(draw.getSpecialNumber()).contains(expectedSpecials.get(draw.stationCode()));
      int totalNumbers = draw.numbers().values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers).isEqualTo(18);
    }
  }

  @Test
  @DisplayName("Fixture 3: Saturday draw (2026-11-07) extracts all 4 stations with 18 numbers each")
  void testSaturdayFixtureAllStations() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-07.html");
    List<DrawResult> results = parser.parseAll(html);

    assertThat(results).hasSize(4);

    Map<String, String> expectedSpecials =
        Map.of(
            "tp-hcm", "987654",
            "long-an", "654321",
            "hau-giang", "321987",
            "binh-phuoc", "098765");

    for (DrawResult draw : results) {
      assertThat(draw.drawDate()).isEqualTo(LocalDate.of(2026, 11, 7));
      assertThat(draw.isComplete()).isTrue();
      assertThat(draw.getSpecialNumber()).contains(expectedSpecials.get(draw.stationCode()));
      int totalNumbers = draw.numbers().values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers).isEqualTo(18);
    }
  }
}
