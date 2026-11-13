package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("XsktHtmlParser Station Section Parsing (T04.06 & T04.08)")
class XsktHtmlParserTest {

  private final XsktHtmlParser parser = new XsktHtmlParser();

  private String loadHtml(String filename) throws Exception {
    try (InputStream is = getClass().getResourceAsStream("/html/" + filename)) {
      assertThat(is).as("HTML fixture /html/" + filename + " must exist").isNotNull();
      return new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  @Test
  @DisplayName("parseStationSections returns 3 stations for Monday draw 2026-11-02")
  void parseMondaySections() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-02.html");

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);

    assertThat(sections).hasSize(3);
    assertThat(sections)
        .extracting(XsktHtmlParser.StationSection::stationCode)
        .containsExactly("tp-hcm", "dong-thap", "ca-mau");
    assertThat(sections.getFirst().drawDate()).isEqualTo(LocalDate.of(2026, 11, 2));
  }

  @Test
  @DisplayName("parseStationSections returns 3 stations for Tuesday draw 2026-11-03")
  void parseTuesdaySections() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-03.html");

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);

    assertThat(sections).hasSize(3);
    assertThat(sections)
        .extracting(XsktHtmlParser.StationSection::stationCode)
        .containsExactly("ben-tre", "vung-tau", "bac-lieu");
    assertThat(sections.getFirst().drawDate()).isEqualTo(LocalDate.of(2026, 11, 3));
  }

  @Test
  @DisplayName("parseStationSections returns 4 stations for Saturday draw 2026-11-07")
  void parseSaturdaySections() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-07.html");

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);

    assertThat(sections).hasSize(4);
    assertThat(sections)
        .extracting(XsktHtmlParser.StationSection::stationCode)
        .containsExactly("tp-hcm", "long-an", "hau-giang", "binh-phuoc");
    assertThat(sections.getFirst().drawDate()).isEqualTo(LocalDate.of(2026, 11, 7));
  }

  @Test
  @DisplayName("parsePrizes extracts exactly 18 numbers per station for Monday draw")
  void parsePrizesMondayDraw() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-02.html");

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);
    assertThat(sections).hasSize(3);

    for (XsktHtmlParser.StationSection section : sections) {
      Map<PrizeTier, List<String>> prizes = parser.parsePrizes(section);
      int totalNumbers = prizes.values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers)
          .as("Station " + section.stationCode() + " must have 18 winning numbers")
          .isEqualTo(18);
    }

    // Check TP.HCM specific numbers
    XsktHtmlParser.StationSection tphcm = sections.get(0);
    Map<PrizeTier, List<String>> tphcmPrizes = parser.parsePrizes(tphcm);
    assertThat(tphcmPrizes.get(PrizeTier.SPECIAL)).containsExactly("482915");
    assertThat(tphcmPrizes.get(PrizeTier.EIGHTH)).containsExactly("15");
    assertThat(tphcmPrizes.get(PrizeTier.FOURTH))
        .containsExactly("17523", "49182", "30819", "65471", "82934", "10283", "74659");

    // Check Đồng Tháp leading zero preservation
    XsktHtmlParser.StationSection dt = sections.get(1);
    Map<PrizeTier, List<String>> dtPrizes = parser.parsePrizes(dt);
    assertThat(dtPrizes.get(PrizeTier.SPECIAL)).containsExactly("019283");
  }

  @Test
  @DisplayName("parsePrizes extracts exactly 18 numbers per station for Saturday 4-station draw")
  void parsePrizesSaturdayDraw() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-07.html");

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);
    assertThat(sections).hasSize(4);

    for (XsktHtmlParser.StationSection section : sections) {
      Map<PrizeTier, List<String>> prizes = parser.parsePrizes(section);
      int totalNumbers = prizes.values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers)
          .as("Station " + section.stationCode() + " must have 18 winning numbers")
          .isEqualTo(18);
    }
  }

  @Test
  @DisplayName("parseDrawResult validates and normalizes all 18 numbers into domain DrawResult")
  void parseDrawResultValid() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-02.html");
    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);

    DrawResult drawResult = parser.parseDrawResult(sections.getFirst());

    assertThat(drawResult.stationCode()).isEqualTo("tp-hcm");
    assertThat(drawResult.drawDate()).isEqualTo(LocalDate.of(2026, 11, 2));
    assertThat(drawResult.isComplete()).isTrue();
    assertThat(drawResult.getSpecialNumber()).contains("482915");
  }

  @Test
  @DisplayName("parseDrawResult throws DrawParseException when a prize tier is missing")
  void parseDrawResultMissingTierThrowsException() {
    String corruptHtml =
        """
        <html><body>
        <table class="tbl-xsmn" data-date="2026-11-02">
          <thead><tr><th>Giải</th><th data-station="tp-hcm">TP.HCM</th></tr></thead>
          <tbody>
            <tr class="gdb"><td class="prize-label">ĐB</td><td>123456</td></tr>
          </tbody>
        </table>
        </body></html>
        """;

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(corruptHtml);
    assertThat(sections).hasSize(1);

    assertThatThrownBy(() -> parser.parseDrawResult(sections.getFirst()))
        .isInstanceOf(DrawParseException.class)
        .hasMessageContaining("Lỗi cấu trúc kết quả mở thưởng đài [tp-hcm]");
  }

  @Test
  @DisplayName("parseDrawResult throws DrawParseException when digit count is wrong")
  void parseDrawResultWrongDigitCountThrowsException() {
    String corruptHtml =
        """
        <html><body>
        <table class="tbl-xsmn" data-date="2026-11-02">
          <thead><tr><th>Giải</th><th data-station="tp-hcm">TP.HCM</th></tr></thead>
          <tbody>
            <tr class="g8"><td class="prize-label">G.8</td><td>123</td></tr> <!-- G8 requires 2 digits, not 3 -->
            <tr class="g7"><td class="prize-label">G.7</td><td>123</td></tr>
            <tr class="g6"><td class="prize-label">G.6</td><td>1234 5678 9012</td></tr>
            <tr class="g5"><td class="prize-label">G.5</td><td>1234</td></tr>
            <tr class="g4"><td class="prize-label">G.4</td><td>12345 23456 34567 45678 56789 67890 78901</td></tr>
            <tr class="g3"><td class="prize-label">G.3</td><td>12345 67890</td></tr>
            <tr class="g2"><td class="prize-label">G.2</td><td>12345</td></tr>
            <tr class="g1"><td class="prize-label">G.1</td><td>12345</td></tr>
            <tr class="gdb"><td class="prize-label">ĐB</td><td>123456</td></tr>
          </tbody>
        </table>
        </body></html>
        """;

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(corruptHtml);

    assertThatThrownBy(() -> parser.parseDrawResult(sections.getFirst()))
        .isInstanceOf(DrawParseException.class)
        .hasMessageContaining("không hợp lệ (phải đúng 2 chữ số)");
  }
}
