package com.dove.adapter.cli;

import com.dove.application.IngestDrawsUseCase;
import com.dove.application.IngestDrawsUseCase.IngestSummary;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * CLI Runner supporting historical backfill of lottery draw results for N consecutive days.
 *
 * <p>Can be invoked via command-line arguments: {@code --backfill --days=N} or {@code ingest
 * --days=N}.
 */
@Component
public class BackfillRunner implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(BackfillRunner.class);

  private final IngestDrawsUseCase ingestUseCase;
  private final Clock clock;

  public BackfillRunner(IngestDrawsUseCase ingestUseCase, Clock clock) {
    this.ingestUseCase = Objects.requireNonNull(ingestUseCase, "ingestUseCase must not be null");
    this.clock = Objects.requireNonNull(clock, "clock must not be null");
  }

  public record BackfillResult(
      int totalDays, int totalSaved, int totalAlreadyExisted, int totalFailed) {}

  /**
   * Runs sequential backfill for N days up to {@code endDate} (inclusive).
   *
   * @param days number of consecutive days to ingest
   * @param endDate the final date of the backfill range
   * @return aggregated summary of backfill operation
   */
  public BackfillResult runBackfill(int days, LocalDate endDate) {
    if (days <= 0) {
      throw new IllegalArgumentException("Days must be greater than 0");
    }
    Objects.requireNonNull(endDate, "endDate must not be null");

    LocalDate startDate = endDate.minusDays(days - 1);
    log.info("Bắt đầu backfill kết quả xổ số từ [{}] đến [{}] ({} ngày)", startDate, endDate, days);

    int totalSaved = 0;
    int totalAlreadyExisted = 0;
    int totalFailed = 0;

    LocalDate current = startDate;
    while (!current.isAfter(endDate)) {
      log.info("Backfill ngày [{}]...", current);
      IngestSummary summary = ingestUseCase.ingestForDate(current);
      totalSaved += summary.newlySaved();
      totalAlreadyExisted += summary.alreadyExisted();
      totalFailed += summary.failedOrUnavailable();
      current = current.plusDays(1);
    }

    log.info(
        "Hoàn tất backfill {} ngày: lưu mới={}, đã có={}, thất bại={}",
        days,
        totalSaved,
        totalAlreadyExisted,
        totalFailed);

    return new BackfillResult(days, totalSaved, totalAlreadyExisted, totalFailed);
  }

  @Override
  public void run(ApplicationArguments args) {
    boolean shouldRun =
        args.containsOption("backfill")
            || args.getNonOptionArgs().contains("ingest")
            || args.getNonOptionArgs().contains("backfill");

    if (!shouldRun) {
      return;
    }

    int days = 7;
    if (args.containsOption("days")) {
      try {
        days = Integer.parseInt(args.getOptionValues("days").get(0));
      } catch (NumberFormatException e) {
        log.warn("Tham số --days không hợp lệ, dùng giá trị mặc định 7 ngày");
      }
    }

    LocalDate endDate = LocalDate.now(clock);
    runBackfill(days, endDate);
  }
}
