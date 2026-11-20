package com.dove.adapter.source;

import com.dove.domain.DrawResult;
import com.dove.domain.InvalidDrawResultException;
import com.dove.domain.PrizeTier;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
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
  private static final Pattern DOCKQ_DATE_PATTERN =
      Pattern.compile("(\\d{1,2})-(\\d{1,2})-(\\d{4})$");
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

    // Check if table has specific data-date or authoritative dockq[data-url]
    String tableDateAttr = table.attr("data-date");
    if (!tableDateAttr.isBlank()) {
      try {
        drawDate = LocalDate.parse(tableDateAttr);
      } catch (Exception ignored) {
      }
    } else {
      for (Element dockq : table.select("i.dockq[data-url], [data-url]")) {
        Matcher dm = DOCKQ_DATE_PATTERN.matcher(dockq.attr("data-url").trim());
        if (dm.find()) {
          try {
            drawDate =
                LocalDate.of(
                    Integer.parseInt(dm.group(3)),
                    Integer.parseInt(dm.group(2)),
                    Integer.parseInt(dm.group(1)));
            break;
          } catch (Exception ignored) {
          }
        }
      }
    }

    if (drawDate == null) {
      return List.of();
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

  /**
   * Extracts winning numbers per prize tier for a given station section.
   *
   * @param section the parsed station section
   * @return map of PrizeTier to list of winning numbers for that station
   */
  public Map<PrizeTier, List<String>> parsePrizes(StationSection section) {
    Objects.requireNonNull(section, "section không được null");
    Element table = section.tableElement();
    if (table == null) {
      return Collections.emptyMap();
    }

    Map<PrizeTier, List<String>> result = new EnumMap<>(PrizeTier.class);
    Elements rows = table.select("tbody tr, tr");

    for (Element row : rows) {
      Element labelCell =
          row.selectFirst("td.prize-label, td.prize-name, th.prize-label, td:first-child");
      String labelText = labelCell != null ? labelCell.text() : "";
      PrizeTier tier = resolvePrizeTier(labelText, row.className());
      if (tier == null) {
        continue;
      }

      Elements cells = row.select("td");
      if (section.columnIndex() < cells.size()) {
        Element valueCell = cells.get(section.columnIndex());
        List<String> numbers = extractNumbersFromCell(valueCell);
        if (!numbers.isEmpty()) {
          result.computeIfAbsent(tier, k -> new ArrayList<>()).addAll(numbers);
        }
      }
    }

    return Collections.unmodifiableMap(result);
  }

  /**
   * Parses, normalizes, and validates the lottery draw result for the given station section.
   *
   * @param section the station section
   * @return a valid, complete 18-number domain DrawResult
   * @throws DrawParseException if the parsed result fails structural validation
   */
  public DrawResult parseDrawResult(StationSection section) {
    Objects.requireNonNull(section, "section không được null");
    Map<PrizeTier, List<String>> rawPrizes = parsePrizes(section);

    Map<PrizeTier, List<String>> normalizedPrizes = new EnumMap<>(PrizeTier.class);
    rawPrizes.forEach(
        (tier, list) -> {
          if (tier != null && list != null) {
            List<String> sanitized =
                list.stream()
                    .map(s -> s != null ? s.replaceAll("[^0-9]", "") : "")
                    .filter(s -> !s.isBlank())
                    .toList();
            normalizedPrizes.put(tier, sanitized);
          }
        });

    DrawResult drawResult =
        new DrawResult(section.stationCode(), section.drawDate(), normalizedPrizes);
    try {
      drawResult.validate();
    } catch (InvalidDrawResultException ex) {
      throw new DrawParseException(
          "Lỗi cấu trúc kết quả mở thưởng đài ["
              + section.stationCode()
              + "] ngày ["
              + section.drawDate()
              + "]: "
              + ex.getMessage(),
          ex);
    }

    return drawResult;
  }

  /**
   * Parses all station draws present in the HTML document.
   *
   * @param html raw HTML string
   * @return list of validated domain DrawResults
   */
  public List<DrawResult> parseAll(String html) {
    List<StationSection> sections = parseStationSections(html);
    List<DrawResult> results = new ArrayList<>(sections.size());
    for (StationSection section : sections) {
      results.add(parseDrawResult(section));
    }
    return Collections.unmodifiableList(results);
  }

  /**
   * Matches a normalized label such as "giai bay", "g 7", "g7", "db" or "dac biet" as a whole, so
   * "giai bay" can never be read as "ba" (T13.06).
   */
  private static final Pattern PRIZE_LABEL_PATTERN =
      Pattern.compile("^(?:(?:giai|g)\\s*)?(dac biet|db|nhat|nhi|ba|tu|nam|sau|bay|tam|[1-8])$");

  private static final Map<String, PrizeTier> PRIZE_WORDS =
      Map.ofEntries(
          Map.entry("dac biet", PrizeTier.SPECIAL),
          Map.entry("db", PrizeTier.SPECIAL),
          Map.entry("nhat", PrizeTier.FIRST),
          Map.entry("1", PrizeTier.FIRST),
          Map.entry("nhi", PrizeTier.SECOND),
          Map.entry("2", PrizeTier.SECOND),
          Map.entry("ba", PrizeTier.THIRD),
          Map.entry("3", PrizeTier.THIRD),
          Map.entry("tu", PrizeTier.FOURTH),
          Map.entry("4", PrizeTier.FOURTH),
          Map.entry("nam", PrizeTier.FIFTH),
          Map.entry("5", PrizeTier.FIFTH),
          Map.entry("sau", PrizeTier.SIXTH),
          Map.entry("6", PrizeTier.SIXTH),
          Map.entry("bay", PrizeTier.SEVENTH),
          Map.entry("7", PrizeTier.SEVENTH),
          Map.entry("tam", PrizeTier.EIGHTH),
          Map.entry("8", PrizeTier.EIGHTH));

  private static final Map<String, PrizeTier> PRIZE_ROW_CLASSES =
      Map.of(
          "gdb", PrizeTier.SPECIAL,
          "special", PrizeTier.SPECIAL,
          "g1", PrizeTier.FIRST,
          "g2", PrizeTier.SECOND,
          "g3", PrizeTier.THIRD,
          "g4", PrizeTier.FOURTH,
          "g5", PrizeTier.FIFTH,
          "g6", PrizeTier.SIXTH,
          "g7", PrizeTier.SEVENTH,
          "g8", PrizeTier.EIGHTH);

  /**
   * Resolves prize tier from the row label (whole-token match) or, failing that, from an exact row
   * CSS class ({@code gdb}, {@code g1}..{@code g8}). Returns null for non-prize rows.
   */
  public PrizeTier resolvePrizeTier(String labelText, String className) {
    Matcher m = PRIZE_LABEL_PATTERN.matcher(normalizeString(labelText).replace("-", " ").trim());
    if (m.matches()) {
      return PRIZE_WORDS.get(m.group(1));
    }
    if (className != null) {
      for (String cls : className.toLowerCase(Locale.ROOT).trim().split("\\s+")) {
        PrizeTier tier = PRIZE_ROW_CLASSES.get(cls);
        if (tier != null) {
          return tier;
        }
      }
    }
    return null;
  }

  /** Extracts clean digit tokens from an HTML table cell. */
  public List<String> extractNumbersFromCell(Element cell) {
    if (cell == null) {
      return List.of();
    }
    String text = cell.text();
    String digitsOnly = text.replaceAll("[^0-9]", " ");
    String[] tokens = digitsOnly.trim().split("\\s+");
    List<String> list = new ArrayList<>();
    for (String token : tokens) {
      if (!token.isBlank()) {
        list.add(token.trim());
      }
    }
    return list;
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
    Element dateElem = doc.selectFirst("[data-date]");
    if (dateElem != null && !dateElem.attr("data-date").isBlank()) {
      try {
        return LocalDate.parse(dateElem.attr("data-date").trim());
      } catch (Exception ignored) {
      }
    }

    Elements titles = doc.select("h1, h2, title, .box-ketqua, .title-xsmn");
    for (Element el : titles) {
      String text = el.text();
      Matcher m = DATE_PATTERN.matcher(text);
      if (m.find()) {
        if (m.group(1) != null) {
          return LocalDate.of(
              Integer.parseInt(m.group(1)),
              Integer.parseInt(m.group(2)),
              Integer.parseInt(m.group(3)));
        } else if (m.group(4) != null) {
          return LocalDate.of(
              Integer.parseInt(m.group(6)),
              Integer.parseInt(m.group(5)),
              Integer.parseInt(m.group(4)));
        }
      }
    }

    return null;
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
