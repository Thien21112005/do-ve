package com.dove.application;

import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Use case that orchestrates the ingestion of lottery results for a given date across all scheduled
 * stations.
 */
@Service
public class IngestDrawsUseCase {

  private static final Logger log = LoggerFactory.getLogger(IngestDrawsUseCase.class);

  private final StationSchedulePort schedulePort;
  private final ResultSource resultSource;
  private final DrawRepository drawRepository;

  public IngestDrawsUseCase(
      StationSchedulePort schedulePort, ResultSource resultSource, DrawRepository drawRepository) {
    this.schedulePort = Objects.requireNonNull(schedulePort, "schedulePort must not be null");
    this.resultSource = Objects.requireNonNull(resultSource, "resultSource must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
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
      try {
        Optional<DrawResult> fetched = resultSource.fetch(stationCode, date);
        if (fetched.isPresent()) {
          boolean saved = drawRepository.saveIfAbsent(fetched.get(), "SCRAPER");
          if (saved) {
            newlySaved++;
            log.info("Lưu thành công kết quả đài [{}] ngày [{}]", stationCode, date);
          } else {
            alreadyExisted++;
            log.debug("Kết quả đài [{}] ngày [{}] đã có trong cơ sở dữ liệu", stationCode, date);
          }
        } else {
          failedOrUnavailable++;
          log.warn("Chưa thể lấy kết quả đài [{}] ngày [{}] từ nguồn", stationCode, date);
        }
      } catch (Exception ex) {
        failedOrUnavailable++;
        log.error(
            "Lỗi khi xử lý ingest đài [{}] ngày [{}]: {}", stationCode, date, ex.getMessage(), ex);
      }
    }

    return new IngestSummary(
        date, scheduledStations.size(), newlySaved, alreadyExisted, failedOrUnavailable);
  }
}
