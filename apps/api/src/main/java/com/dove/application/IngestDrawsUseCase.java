package com.dove.application;

import com.dove.domain.DrawResult;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Use case that orchestrates the ingestion of lottery results for a given date across all scheduled
 * stations, tracking operational metrics and execution latency.
 */
@Service
public class IngestDrawsUseCase {

  private static final Logger log = LoggerFactory.getLogger(IngestDrawsUseCase.class);

  private final StationSchedulePort schedulePort;
  private final ResultSource resultSource;
  private final DrawRepository drawRepository;
  private final Counter successCounter;
  private final Counter failureCounter;
  private final Timer ingestTimer;

  public IngestDrawsUseCase(
      StationSchedulePort schedulePort,
      ResultSource resultSource,
      DrawRepository drawRepository,
      MeterRegistry meterRegistry) {
    this.schedulePort = Objects.requireNonNull(schedulePort, "schedulePort must not be null");
    this.resultSource = Objects.requireNonNull(resultSource, "resultSource must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    Objects.requireNonNull(meterRegistry, "meterRegistry must not be null");

    this.successCounter = meterRegistry.counter("ingest.success");
    this.failureCounter = meterRegistry.counter("ingest.failure");
    this.ingestTimer = meterRegistry.timer("ingest.time");
  }

  public IngestDrawsUseCase(
      StationSchedulePort schedulePort, ResultSource resultSource, DrawRepository drawRepository) {
    this(schedulePort, resultSource, drawRepository, new SimpleMeterRegistry());
  }

  public record IngestSummary(
      LocalDate date,
      int totalStations,
      int newlySaved,
      int alreadyExisted,
      int failedOrUnavailable) {}

  /**
   * Ingests draw results for all scheduled stations on the given date.
   *
   * @param date the date of the draw
   * @return summary of the ingestion execution
   */
  public IngestSummary ingestForDate(LocalDate date) {
    Objects.requireNonNull(date, "date must not be null");
    List<String> scheduledStations = schedulePort.getDrawingStationCodes(date);

    int newlySaved = 0;
    int alreadyExisted = 0;
    int failedOrUnavailable = 0;

    for (String stationCode : scheduledStations) {
      long startTimeMs = System.currentTimeMillis();
      try {
        // T04.14: Check if draw is already stored and complete before querying external source
        Optional<DrawResult> existing = drawRepository.findByStationAndDate(stationCode, date);
        if (existing.isPresent() && existing.get().isComplete()) {
          alreadyExisted++;
          long durationMs = System.currentTimeMillis() - startTimeMs;
          ingestTimer.record(durationMs, TimeUnit.MILLISECONDS);
          log.debug(
              "Kỳ quay [{}] ngày [{}] đã lưu đủ 18 số (xử lý {} ms), bỏ qua không gọi nguồn",
              stationCode,
              date,
              durationMs);
          continue;
        }

        Optional<DrawResult> fetched = resultSource.fetch(stationCode, date);
        long durationMs = System.currentTimeMillis() - startTimeMs;
        ingestTimer.record(durationMs, TimeUnit.MILLISECONDS);

        if (fetched.isPresent()) {
          boolean saved = drawRepository.saveIfAbsent(fetched.get(), "SCRAPER");
          if (saved) {
            newlySaved++;
            successCounter.increment();
            log.info(
                "Lưu thành công kết quả đài [{}] ngày [{}] trong [{} ms]",
                stationCode,
                date,
                durationMs);
          } else {
            alreadyExisted++;
            log.debug(
                "Kết quả đài [{}] ngày [{}] đã có trong cơ sở dữ liệu ({} ms)",
                stationCode,
                date,
                durationMs);
          }
        } else {
          failedOrUnavailable++;
          failureCounter.increment();
          log.warn(
              "Chưa thể lấy kết quả đài [{}] ngày [{}] từ nguồn sau [{} ms]",
              stationCode,
              date,
              durationMs);
        }
      } catch (Exception ex) {
        long durationMs = System.currentTimeMillis() - startTimeMs;
        ingestTimer.record(durationMs, TimeUnit.MILLISECONDS);
        failedOrUnavailable++;
        failureCounter.increment();
        log.error(
            "Lỗi khi xử lý ingest đài [{}] ngày [{}] sau [{} ms]: {}",
            stationCode,
            date,
            durationMs,
            ex.getMessage(),
            ex);
      }
    }

    return new IngestSummary(
        date, scheduledStations.size(), newlySaved, alreadyExisted, failedOrUnavailable);
  }
}
