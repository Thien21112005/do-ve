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

    // 2. Build target URL
    String url = buildUrl(drawDate);

    try {
      // 3. Acquire rate limiter token
      throttler.acquire();

      // 4. Fetch HTML with retry & backoff
      String html = retryExecutor.executeWithRetry(() -> httpClient.fetchHtml(url));
      if (html == null || html.isBlank()) {
        log.warn("Nhận HTML rỗng từ nguồn xskt cho ngày {}", drawDate);
        return Optional.empty();
      }

      // 5. Parse all stations present in HTML
      List<DrawResult> draws = parser.parseAll(html);
      Map<String, DrawResult> cacheEntry =
          dateCache.computeIfAbsent(drawDate, k -> new ConcurrentHashMap<>());
      for (DrawResult draw : draws) {
        cacheEntry.put(draw.stationCode(), draw);
      }

      return Optional.ofNullable(cacheEntry.get(stationCode));
    } catch (HttpStatusException ex) {
      if (ex.isClientError()) {
        log.info(
            "Chưa có kết quả hoặc trang không tồn tại (HTTP {}) cho URL: {}",
            ex.getStatusCode(),
            url);
      } else {
        log.error("Lỗi HTTP từ nguồn khi tải ngày {}: {}", drawDate, ex.getMessage());
      }
      return Optional.empty();
    } catch (DrawParseException ex) {
      log.error("Lỗi parse kết quả từ HTML ngày {}: {}", drawDate, ex.getMessage());
      return Optional.empty();
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      log.error("Tác vụ fetch bị gián đoạn cho đài {} ngày {}", stationCode, drawDate, ex);
      return Optional.empty();
    } catch (Exception ex) {
      log.error("Lỗi không xác định khi fetch đài {} ngày {}", stationCode, drawDate, ex);
      return Optional.empty();
    }
  }

  /** Constructs the URL for the Southern lottery on a given date. */
  public String buildUrl(LocalDate drawDate) {
    return String.format(
        "%s/xsmn/ngay-%02d-%02d-%04d",
        baseUrl, drawDate.getDayOfMonth(), drawDate.getMonthValue(), drawDate.getYear());
  }

  /** Clears the in-memory date cache. */
  public void clearCache() {
    dateCache.clear();
  }
}
