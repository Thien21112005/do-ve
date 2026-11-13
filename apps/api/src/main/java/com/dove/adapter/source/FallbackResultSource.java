package com.dove.adapter.source;

import com.dove.application.ResultSource;
import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Composite ResultSource that sequentially tries multiple sources in fallback order. If the primary
 * source fails or returns empty, subsequent fallback sources are queried.
 */
public class FallbackResultSource implements ResultSource {

  private static final Logger log = LoggerFactory.getLogger(FallbackResultSource.class);

  private final List<ResultSource> sources;

  public FallbackResultSource(List<ResultSource> sources) {
    Objects.requireNonNull(sources, "sources must not be null");
    if (sources.isEmpty()) {
      throw new IllegalArgumentException("sources list must not be empty");
    }
    this.sources = List.copyOf(sources);
  }

  @Override
  public Optional<DrawResult> fetch(String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(stationCode, "stationCode must not be null");
    Objects.requireNonNull(drawDate, "drawDate must not be null");

    for (int i = 0; i < sources.size(); i++) {
      ResultSource source = sources.get(i);
      String sourceName = source.getClass().getSimpleName();
      try {
        log.debug(
            "Thử lấy kết quả từ nguồn thứ {} [{}] cho đài [{}] ngày [{}]",
            i + 1,
            sourceName,
            stationCode,
            drawDate);
        Optional<DrawResult> result = source.fetch(stationCode, drawDate);
        if (result.isPresent()) {
          log.info(
              "Lấy thành công kết quả từ nguồn thứ {} [{}] cho đài [{}] ngày [{}]",
              i + 1,
              sourceName,
              stationCode,
              drawDate);
          return result;
        }
        log.warn(
            "Nguồn thứ {} [{}] trả về kết quả rỗng cho đài [{}] ngày [{}]",
            i + 1,
            sourceName,
            stationCode,
            drawDate);
      } catch (Exception ex) {
        log.warn(
            "Nguồn thứ {} [{}] bị lỗi khi lấy kết quả cho đài [{}] ngày [{}]: {}",
            i + 1,
            sourceName,
            stationCode,
            drawDate,
            ex.getMessage());
      }
    }

    log.error(
        "Tất cả {} nguồn đều không thể lấy được kết quả cho đài [{}] ngày [{}]",
        sources.size(),
        stationCode,
        drawDate);
    return Optional.empty();
  }
}
