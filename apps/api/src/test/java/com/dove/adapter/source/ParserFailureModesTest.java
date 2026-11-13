package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Parser Failure Modes and Edge Cases (T04.10)")
class ParserFailureModesTest {

  private final XsktHtmlParser parser = new XsktHtmlParser();

  @Test
  @DisplayName("Empty or null HTML returns empty list without error")
  void emptyOrNullHtmlReturnsEmpty() {
    assertThat(parser.parseStationSections(null)).isEmpty();
    assertThat(parser.parseStationSections("")).isEmpty();
    assertThat(parser.parseStationSections("   \n\t  ")).isEmpty();
    assertThat(parser.parseAll(null)).isEmpty();
    assertThat(parser.parseAll("")).isEmpty();
  }

  @Test
  @DisplayName("HTTP 500 or 404 error page without results table returns empty list")
  void errorPageReturnsEmpty() {
    String errorPageHtml =
        """
        <!DOCTYPE html>
        <html>
        <head><title>500 Internal Server Error</title></head>
        <body>
          <h1>500 Internal Server Error</h1>
          <p>The server encountered an internal error and was unable to complete your request.</p>
        </body>
        </html>
        """;

    assertThat(parser.parseStationSections(errorPageHtml)).isEmpty();
    assertThat(parser.parseAll(errorPageHtml)).isEmpty();
  }

  @Test
  @DisplayName("Missing prize tier throws DrawParseException with clear message")
  void missingPrizeTierThrowsException() {
    String htmlMissingG8 =
        """
        <html><body>
        <table class="tbl-xsmn" data-date="2026-11-02">
          <thead><tr><th>Giải</th><th data-station="tp-hcm">TP.HCM</th></tr></thead>
          <tbody>
            <tr class="g7"><td class="prize-label">G.7</td><td>395</td></tr>
            <tr class="g6"><td class="prize-label">G.6</td><td>8192 3048 6721</td></tr>
            <tr class="g5"><td class="prize-label">G.5</td><td>5928</td></tr>
            <tr class="g4"><td class="prize-label">G.4</td><td>17523 49182 30819 65471 82934 10283 74659</td></tr>
            <tr class="g3"><td class="prize-label">G.3</td><td>62481 90135</td></tr>
            <tr class="g2"><td class="prize-label">G.2</td><td>81057</td></tr>
            <tr class="g1"><td class="prize-label">G.1</td><td>73924</td></tr>
            <tr class="gdb"><td class="prize-label">ĐB</td><td>482915</td></tr>
          </tbody>
        </table>
        </body></html>
        """;

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(htmlMissingG8);
    assertThat(sections).hasSize(1);

    assertThatThrownBy(() -> parser.parseDrawResult(sections.getFirst()))
        .isInstanceOf(DrawParseException.class)
        .hasMessageContaining("Lỗi cấu trúc kết quả mở thưởng đài [tp-hcm]")
        .hasMessageContaining("Giải tám yêu cầu đúng 1 số, nhận được 0");
  }

  @Test
  @DisplayName("Incomplete draw with only 5 numbers in Fourth Prize throws DrawParseException")
  void incompleteFourthPrizeThrowsException() {
    String htmlIncompleteG4 =
        """
        <html><body>
        <table class="tbl-xsmn" data-date="2026-11-02">
          <thead><tr><th>Giải</th><th data-station="tp-hcm">TP.HCM</th></tr></thead>
          <tbody>
            <tr class="g8"><td class="prize-label">G.8</td><td>15</td></tr>
            <tr class="g7"><td class="prize-label">G.7</td><td>395</td></tr>
            <tr class="g6"><td class="prize-label">G.6</td><td>8192 3048 6721</td></tr>
            <tr class="g5"><td class="prize-label">G.5</td><td>5928</td></tr>
            <tr class="g4"><td class="prize-label">G.4</td><td>17523 49182 30819 65471 82934</td></tr> <!-- Only 5 numbers, needs 7 -->
            <tr class="g3"><td class="prize-label">G.3</td><td>62481 90135</td></tr>
            <tr class="g2"><td class="prize-label">G.2</td><td>81057</td></tr>
            <tr class="g1"><td class="prize-label">G.1</td><td>73924</td></tr>
            <tr class="gdb"><td class="prize-label">ĐB</td><td>482915</td></tr>
          </tbody>
        </table>
        </body></html>
        """;

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(htmlIncompleteG4);
    assertThatThrownBy(() -> parser.parseDrawResult(sections.getFirst()))
        .isInstanceOf(DrawParseException.class)
        .hasMessageContaining("Giải tư yêu cầu đúng 7 số, nhận được 5");
  }

  @Test
  @DisplayName("Non-digit characters or wrong length in numbers throws DrawParseException")
  void malformedNumberThrowsException() {
    String htmlWrongDigits =
        """
        <html><body>
        <table class="tbl-xsmn" data-date="2026-11-02">
          <thead><tr><th>Giải</th><th data-station="tp-hcm">TP.HCM</th></tr></thead>
          <tbody>
            <tr class="g8"><td class="prize-label">G.8</td><td>15</td></tr>
            <tr class="g7"><td class="prize-label">G.7</td><td>395</td></tr>
            <tr class="g6"><td class="prize-label">G.6</td><td>8192 3048 6721</td></tr>
            <tr class="g5"><td class="prize-label">G.5</td><td>5928</td></tr>
            <tr class="g4"><td class="prize-label">G.4</td><td>17523 49182 30819 65471 82934 10283 74659</td></tr>
            <tr class="g3"><td class="prize-label">G.3</td><td>62481 90135</td></tr>
            <tr class="g2"><td class="prize-label">G.2</td><td>81057</td></tr>
            <tr class="g1"><td class="prize-label">G.1</td><td>73924</td></tr>
            <tr class="gdb"><td class="prize-label">ĐB</td><td>48291</td></tr> <!-- 5 digits instead of 6 -->
          </tbody>
        </table>
        </body></html>
        """;

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(htmlWrongDigits);
    assertThatThrownBy(() -> parser.parseDrawResult(sections.getFirst()))
        .isInstanceOf(DrawParseException.class)
        .hasMessageContaining("Giải đặc biệt không hợp lệ (phải đúng 6 chữ số)");
  }

  @Test
  @DisplayName("Null section parameter throws NullPointerException")
  void nullSectionThrowsNpe() {
    assertThatThrownBy(() -> parser.parseDrawResult(null)).isInstanceOf(NullPointerException.class);
    assertThatThrownBy(() -> parser.parsePrizes(null)).isInstanceOf(NullPointerException.class);
  }
}
