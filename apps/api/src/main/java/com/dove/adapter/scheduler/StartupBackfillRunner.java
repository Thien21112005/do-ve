package com.dove.adapter.scheduler;

import com.dove.application.OnDemandDrawBackfillService;
import jakarta.annotation.PreDestroy;
import java.time.LocalDate;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Asynchronous catch-up runner that backfills missing lottery draws for the most recent {@code
 * days} (default 14) as soon as the Spring Boot application is ready, newest date first, without
 * blocking HTTP server startup.
 */
@Component
public class StartupBackfillRunner {

  private static final Logger log = LoggerFactory.getLogger(StartupBackfillRunner.class);

  private final OnDemandDrawBackfillService backfillService;
  private final boolean enabled;
  private final int days;
  private final AtomicBoolean stopped = new AtomicBoolean(false);
  private volatile Thread workerThread;

  public StartupBackfillRunner(
      OnDemandDrawBackfillService backfillService,
      @Value("${dove.ingestion.startup-backfill.enabled:true}") boolean enabled,
      @Value("${dove.ingestion.startup-backfill.days:14}") int days) {
    this.backfillService =
        Objects.requireNonNull(backfillService, "backfillService must not be null");
    this.enabled = enabled;
    this.days = days;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void onApplicationReady() {
    if (!enabled || days <= 0 || stopped.get()) {
      log.debug("Startup catch-up backfill đang tắt (enabled={}, days={})", enabled, days);
      return;
    }

    Thread worker = new Thread(this::runCatchUpSynchronously, "dove-startup-backfill");
    worker.setDaemon(true);
    this.workerThread = worker;
    worker.start();
  }

  @PreDestroy
  public void shutdown() {
    stopped.set(true);
    Thread worker = this.workerThread;
    if (worker != null) {
      worker.interrupt();
    }
  }

  /**
   * Iterates from the latest expected completed date backwards for {@code days} days, skipping
   * dates already complete in PostgreSQL and ingesting missing dates via single-flight backfill.
   *
   * @return number of calendar days inspected
   */
  public int runCatchUpSynchronously() {
    if (!enabled || days <= 0 || stopped.get()) {
      return 0;
    }

    LocalDate endDate = backfillService.latestExpectedCompletedDate();
    LocalDate startDate = endDate.minusDays(days - 1L);
    log.info(
        "Khởi chạy startup catch-up backfill {} ngày gần nhất ([{}] -> [{}])",
        days,
        endDate,
        startDate);

    int inspected = 0;
    for (int offset = 0; offset < days; offset++) {
      if (stopped.get() || Thread.currentThread().isInterrupted()) {
        log.info("Dừng sớm startup catch-up backfill do ứng dụng đang đóng");
        break;
      }
      LocalDate date = endDate.minusDays(offset);
      inspected++;
      backfillService.ensureDateIngested(date);
    }

    log.info("Hoàn tất kiểm tra startup catch-up backfill {} ngày gần nhất", inspected);
    return inspected;
  }
}
