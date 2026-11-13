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
}
