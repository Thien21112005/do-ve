package com.dove.adapter.source;

import com.dove.application.ResultSource;
import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Adapter implementing the ResultSource port for fetching and parsing results from xskt.com.vn.
 * Orchestrates HTTP communication, rate limiting (FR-ING-05), retries (FR-ING-04), HTML parsing,
 * and per-day in-memory caching to prevent duplicate network calls.
 */
@Component
public class XsktResultSourceAdapter implements ResultSource {

  private static final Logger log = LoggerFactory.getLogger(XsktResultSourceAdapter.class);
  private static final int MAX_CACHED_DATES = 30;

  private final LotteryHttpClient httpClient;
  private final XsktHtmlParser parser;
  private final RequestThrottler throttler;
  private final RetryExecutor retryExecutor;
  private final String baseUrl;

  // Cache parsed draws by date to prevent refetching the same page for other stations
  private final Map<LocalDate, Map<String, DrawResult>> dateCache = new ConcurrentHashMap<>();

  public XsktResultSourceAdapter(
      LotteryHttpClient httpClient,
      XsktHtmlParser parser,
      RequestThrottler throttler,
      RetryExecutor retryExecutor,
      @Value("${dove.ingestion.xskt.base-url:https://xskt.com.vn}") String baseUrl) {
    this.httpClient = httpClient;
    this.parser = parser;
    this.throttler = throttler;
    this.retryExecutor = retryExecutor;
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
  }

  Map<LocalDate, Map<String, DrawResult>> getDateCache() {
    return dateCache;
  }

  @Override
  public Optional<DrawResult> fetch(String stationCode, LocalDate drawDate) {
    if (stationCode == null || drawDate == null) {
      return Optional.empty();
    }

    // 1. Check local cache for this date
    Map<String, DrawResult> stationMap = dateCache.get(drawDate);
    if (stationMap != null && stationMap.containsKey(stationCode)) {
      return Optional.of(stationMap.get(stationCode));
    }

    // 2. Try primary URL (/xsmn/ngay-DD-MM-YYYY), then short URL (/xsmn/ngay-DD-MM) if stale
    List<DrawResult> matchingDraws = fetchMatchingDrawsFromUrl(buildUrl(drawDate), drawDate);
    if (matchingDraws.isEmpty()) {
      matchingDraws = fetchMatchingDrawsFromUrl(buildShortYearUrl(drawDate), drawDate);
    }

    if (matchingDraws.isEmpty()) {
      return Optional.empty();
    }

    // Giới hạn kích thước cache để tránh rò rỉ bộ nhớ
    if (dateCache.size() >= MAX_CACHED_DATES) {
      dateCache.clear();
    }

    Map<String, DrawResult> cacheEntry =
        dateCache.computeIfAbsent(drawDate, k -> new ConcurrentHashMap<>());
    for (DrawResult draw : matchingDraws) {
      cacheEntry.put(draw.stationCode(), draw);
    }

    return Optional.ofNullable(cacheEntry.get(stationCode));
  }

  private List<DrawResult> fetchMatchingDrawsFromUrl(String url, LocalDate drawDate) {
    try {
      throttler.acquire();
      String html = retryExecutor.executeWithRetry(() -> httpClient.fetchHtml(url));
      if (html == null || html.isBlank()) {
        log.warn("Nhận HTML rỗng từ nguồn xskt cho URL {}", url);
        return List.of();
      }

      List<DrawResult> draws = parser.parseAll(html);
      List<DrawResult> matchingDraws =
          draws.stream().filter(d -> drawDate.equals(d.drawDate())).toList();

      if (matchingDraws.isEmpty()) {
        log.warn(
            "Trang nguồn xskt [{}] trả về kết quả không khớp ngày yêu cầu (yêu cầu: {}, tìm thấy: {})",
            url,
            drawDate,
            draws.isEmpty() ? "trống" : draws.get(0).drawDate());
      }
      return matchingDraws;
    } catch (HttpStatusException ex) {
      if (ex.isClientError()) {
        log.info(
            "Chưa có kết quả hoặc trang không tồn tại (HTTP {}) cho URL: {}",
            ex.getStatusCode(),
            url);
      } else {
        log.error("Lỗi HTTP từ nguồn khi tải ngày {}: {}", drawDate, ex.getMessage());
      }
      return List.of();
    } catch (DrawParseException ex) {
      log.error("Lỗi parse kết quả từ HTML ngày {}: {}", drawDate, ex.getMessage());
      return List.of();
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      log.error("Tác vụ fetch bị gián đoạn cho URL {} ngày {}", url, drawDate, ex);
      return List.of();
    } catch (Exception ex) {
      log.error("Lỗi không xác định khi fetch URL {} ngày {}", url, drawDate, ex);
      return List.of();
    }
  }

  /** Constructs the URL for the Southern lottery on a given date. */
  public String buildUrl(LocalDate drawDate) {
    return String.format(
        "%s/xsmn/ngay-%02d-%02d-%04d",
        baseUrl, drawDate.getDayOfMonth(), drawDate.getMonthValue(), drawDate.getYear());
  }

  /** Constructs the current-year short URL (/xsmn/ngay-DD-MM) used by xskt.com.vn. */
  public String buildShortYearUrl(LocalDate drawDate) {
    return String.format(
        "%s/xsmn/ngay-%02d-%02d", baseUrl, drawDate.getDayOfMonth(), drawDate.getMonthValue());
  }

  /** Clears the in-memory date cache. */
  public void clearCache() {
    dateCache.clear();
  }
}
