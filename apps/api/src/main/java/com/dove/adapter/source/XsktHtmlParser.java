package com.dove.adapter.source;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

/** Parser for extracting Southern Vietnam lottery results (XSMN) from xskt.com.vn HTML pages. */
@Component
public class XsktHtmlParser {

  private static final Pattern DATE_PATTERN =
      Pattern.compile(
          "(\\d{4})-(\\d{2})-(\\d{2})|ng[aà]y\\s*(\\d{1,2})[-/](\\d{1,2})[-/](\\d{4})",
          Pattern.CASE_INSENSITIVE);
  private static final Pattern HREF_STATION_PATTERN =
      Pattern.compile("xsmn/([a-z-]+)", Pattern.CASE_INSENSITIVE);

  private static final Map<String, String> STATION_NAME_TO_CODE = new HashMap<>();

  static {
    registerStation("tp-hcm", "tp-hcm", "tphcm", "tp hcm", "tp ho chi minh", "ho chi minh");
    registerStation("dong-thap", "dong-thap", "dong thap");
    registerStation("ca-mau", "ca-mau", "ca mau");
    registerStation("ben-tre", "ben-tre", "ben tre");
    registerStation("vung-tau", "vung-tau", "vung tau", "ba ria vung tau");
    registerStation("bac-lieu", "bac-lieu", "bac lieu");
    registerStation("dong-nai", "dong-nai", "dong nai");
    registerStation("can-tho", "can-tho", "can tho");
    registerStation("soc-trang", "soc-trang", "soc trang");
    registerStation("tay-ninh", "tay-ninh", "tay ninh");
    registerStation("an-giang", "an-giang", "an giang");
    registerStation("binh-thuan", "binh-thuan", "binh thuan");
    registerStation("vinh-long", "vinh-long", "vinh long");
    registerStation("binh-duong", "binh-duong", "binh duong");
    registerStation("tra-vinh", "tra-vinh", "tra vinh");
    registerStation("long-an", "long-an", "long an");
    registerStation("hau-giang", "hau-giang", "hau giang");
    registerStation("binh-phuoc", "binh-phuoc", "binh phuoc");
    registerStation("tien-giang", "tien-giang", "tien giang");
    registerStation("kien-giang", "kien-giang", "kien giang");
    registerStation("da-lat", "da-lat", "da lat", "lam dong");
  }

  private static void registerStation(String code, String... aliases) {
    for (String alias : aliases) {
      STATION_NAME_TO_CODE.put(normalizeString(alias), code);
    }
  }

  public record StationSection(
      String stationCode,
      String stationName,
      LocalDate drawDate,
      int columnIndex,
      Element tableElement) {}

  /**
   * Parses the HTML document and extracts individual station sections from the lottery table.
   *
   * @param html raw HTML string
   * @return list of parsed station sections
   */
  public List<StationSection> parseStationSections(String html) {
    if (html == null || html.isBlank()) {
      return List.of();
    }

    Document doc = Jsoup.parse(html);
    LocalDate drawDate = extractDate(doc);

    Element table = doc.selectFirst("table.tbl-xsmn, table.col-xsmn, table.result");
    if (table == null) {
      table = doc.selectFirst("table");
    }
    if (table == null) {
      return List.of();
    }

    // Check if table has specific data-date
    String tableDateAttr = table.attr("data-date");
    if (!tableDateAttr.isBlank()) {
      try {
        drawDate = LocalDate.parse(tableDateAttr);
      } catch (Exception ignored) {
      }
    }

    Elements headerCells = table.select("thead tr th");
    if (headerCells.isEmpty()) {
      headerCells =
          table.select("tr").first() != null
              ? table.select("tr").first().children()
              : new Elements();
    }

    List<StationSection> sections = new ArrayList<>();
    int colIndex = 0;
    for (Element cell : headerCells) {
      // Skip the first prize label column (e.g., "Giải", "col-prize")
      String text = cell.text().trim();
      if (colIndex == 0
          && (cell.hasClass("col-prize")
              || text.equalsIgnoreCase("Giải")
              || text.equalsIgnoreCase("Giai"))) {
        colIndex++;
        continue;
      }

      String stationCode = resolveStationCode(cell);
      if (stationCode != null) {
        sections.add(new StationSection(stationCode, text, drawDate, colIndex, table));
      }
      colIndex++;
    }

    return Collections.unmodifiableList(sections);
  }

  /** Resolves a station code from HTML element attributes or text content. */
  public String resolveStationCode(Element headerCell) {
    if (headerCell == null) {
      return null;
    }

    // 1. Try data-station attribute
    String dataStation = headerCell.attr("data-station");
    if (!dataStation.isBlank() && STATION_NAME_TO_CODE.containsValue(dataStation.trim())) {
      return dataStation.trim();
    }

    // 2. Try link href (e.g. /xsmn/tp-hcm)
    Elements links = headerCell.select("a[href]");
    for (Element link : links) {
      String href = link.attr("href");
      Matcher matcher = HREF_STATION_PATTERN.matcher(href);
      if (matcher.find()) {
        String slug = matcher.group(1).toLowerCase(Locale.ROOT);
        if (STATION_NAME_TO_CODE.containsValue(slug)) {
          return slug;
        }
      }
    }

    // 3. Fallback to header text
    String normalized = normalizeString(headerCell.text());
    return STATION_NAME_TO_CODE.get(normalized);
  }

  private LocalDate extractDate(Document doc) {
    // 1. Try finding in table data-date
    Element dateElem = doc.selectFirst("[data-date]");
    if (dateElem != null && !dateElem.attr("data-date").isBlank()) {
      try {
        return LocalDate.parse(dateElem.attr("data-date").trim());
      } catch (Exception ignored) {
      }
    }

    // 2. Try title or h2 / h1 text
    Elements titles = doc.select("h1, h2, title, .box-ketqua, .title-xsmn");
    for (Element el : titles) {
      String text = el.text();
      Matcher m = DATE_PATTERN.matcher(text);
      if (m.find()) {
        if (m.group(1) != null) {
          // YYYY-MM-DD
          return LocalDate.of(
              Integer.parseInt(m.group(1)),
              Integer.parseInt(m.group(2)),
              Integer.parseInt(m.group(3)));
        } else if (m.group(4) != null) {
          // DD/MM/YYYY
          return LocalDate.of(
              Integer.parseInt(m.group(6)),
              Integer.parseInt(m.group(5)),
              Integer.parseInt(m.group(4)));
        }
      }
    }

    return LocalDate.now();
  }

  private static String normalizeString(String input) {
    if (input == null) {
      return "";
    }
    String stripped =
        Normalizer.normalize(input, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replace("đ", "d")
            .replace("Đ", "d")
            .replaceAll("[^a-zA-Z0-9\\s-]", " ")
            .replaceAll("\\s+", " ")
            .trim()
            .toLowerCase(Locale.ROOT);
    return stripped;
  }
}
