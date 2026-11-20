package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dove.domain.DrawResult;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T13.07 - One malformed station column does not drop the others")
class PartialPageParseTest {

  private final XsktHtmlParser parser = new XsktHtmlParser();

  /** Three stations; the middle one (dong-thap) only has 5 of the 7 Giải tư numbers. */
  private static final String PAGE_WITH_ONE_BAD_COLUMN =
      """
      <html><body>
      <table class="tbl-xsmn" data-date="2026-11-02">
        <thead><tr>
          <th>Giải</th><th data-station="tp-hcm">TP.HCM</th>
          <th data-station="dong-thap">Đồng Tháp</th><th data-station="ca-mau">Cà Mau</th>
        </tr></thead>
        <tbody>
          <tr class="g8"><td>G.8</td><td>15</td><td>27</td><td>03</td></tr>
          <tr class="g7"><td>G.7</td><td>395</td><td>812</td><td>044</td></tr>
          <tr class="g6"><td>G.6</td><td>8192 3048 6721</td><td>1111 2222 3333</td><td>0101 0202 0303</td></tr>
          <tr class="g5"><td>G.5</td><td>5928</td><td>4444</td><td>0505</td></tr>
          <tr class="g4"><td>G.4</td>
            <td>17523 49182 30819 65471 82934 10283 74659</td>
            <td>11111 22222 33333 44444 55555</td>
            <td>01234 12345 23456 34567 45678 56789 67890</td></tr>
          <tr class="g3"><td>G.3</td><td>62481 90135</td><td>66666 77777</td><td>00011 00022</td></tr>
          <tr class="g2"><td>G.2</td><td>81057</td><td>88888</td><td>00033</td></tr>
          <tr class="g1"><td>G.1</td><td>73924</td><td>99999</td><td>00044</td></tr>
          <tr class="gdb"><td>ĐB</td><td>482915</td><td>123456</td><td>012345</td></tr>
        </tbody>
      </table>
      </body></html>
      """;

  @Test
  @DisplayName("parseAll keeps the two valid stations and skips the malformed one")
  void keepsValidStations() {
    List<DrawResult> draws = parser.parseAll(PAGE_WITH_ONE_BAD_COLUMN);

    assertThat(draws).extracting(DrawResult::stationCode).containsExactly("tp-hcm", "ca-mau");
    DrawResult caMau = draws.get(1);
    assertThat(caMau.isComplete()).isTrue();
    assertThat(caMau.getSpecialNumber()).contains("012345");
  }

  @Test
  @DisplayName("parseAll still throws when no station on the page is valid")
  void throwsWhenNothingIsValid() {
    String onlyBad =
        PAGE_WITH_ONE_BAD_COLUMN
            .replace("<th data-station=\"tp-hcm\">TP.HCM</th>", "")
            .replace("<th data-station=\"ca-mau\">Cà Mau</th>", "")
            .replaceAll(
                "<td>(?:15|395|8192 3048 6721|5928|17523[^<]*|62481 90135|81057|73924|482915)</td>",
                "")
            .replaceAll(
                "<td>(?:03|044|0101 0202 0303|0505|01234[^<]*|00011 00022|00033|00044|012345)</td>",
                "");

    assertThatThrownBy(() -> parser.parseAll(onlyBad)).isInstanceOf(DrawParseException.class);
  }
}
