package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("XsktHtmlParser Station Section Parsing (T04.06)")
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
      java.util.Map<com.dove.domain.PrizeTier, List<String>> prizes = parser.parsePrizes(section);
      int totalNumbers = prizes.values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers)
          .as("Station " + section.stationCode() + " must have 18 winning numbers")
          .isEqualTo(18);
    }

    // Check TP.HCM specific numbers
    XsktHtmlParser.StationSection tphcm = sections.get(0);
    java.util.Map<com.dove.domain.PrizeTier, List<String>> tphcmPrizes = parser.parsePrizes(tphcm);
    assertThat(tphcmPrizes.get(com.dove.domain.PrizeTier.SPECIAL)).containsExactly("482915");
    assertThat(tphcmPrizes.get(com.dove.domain.PrizeTier.EIGHTH)).containsExactly("15");
    assertThat(tphcmPrizes.get(com.dove.domain.PrizeTier.FOURTH))
        .containsExactly("17523", "49182", "30819", "65471", "82934", "10283", "74659");

    // Check Đồng Tháp leading zero preservation
    XsktHtmlParser.StationSection dt = sections.get(1);
    java.util.Map<com.dove.domain.PrizeTier, List<String>> dtPrizes = parser.parsePrizes(dt);
    assertThat(dtPrizes.get(com.dove.domain.PrizeTier.SPECIAL)).containsExactly("019283");
  }

  @Test
  @DisplayName("parsePrizes extracts exactly 18 numbers per station for Saturday 4-station draw")
  void parsePrizesSaturdayDraw() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-07.html");

    List<XsktHtmlParser.StationSection> sections = parser.parseStationSections(html);
    assertThat(sections).hasSize(4);

    for (XsktHtmlParser.StationSection section : sections) {
      java.util.Map<com.dove.domain.PrizeTier, List<String>> prizes = parser.parsePrizes(section);
      int totalNumbers = prizes.values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers)
          .as("Station " + section.stationCode() + " must have 18 winning numbers")
          .isEqualTo(18);
    }
  }
}
