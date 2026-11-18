package com.dove.adapter.scheduler;

import com.dove.application.DrawRepository;
import com.dove.application.IngestDrawsUseCase;
import com.dove.application.OnDemandDrawBackfillService;
import com.dove.application.StationSchedulePort;
import com.dove.domain.DrawResult;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled worker that polls for Southern lottery results during the official draw window (16:10 -
 * 17:30 VN). Ceases polling early as soon as all scheduled stations for the day have complete
 * 18-number results.
 */
@Component
public class DrawPollScheduler {

  private static final Logger log = LoggerFactory.getLogger(DrawPollScheduler.class);

  public static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  public static final LocalTime DEFAULT_WINDOW_START = LocalTime.of(16, 10);
  public static final LocalTime DEFAULT_WINDOW_END = LocalTime.of(17, 30);

  private final IngestDrawsUseCase ingestUseCase;
  private final StationSchedulePort schedulePort;
  private final DrawRepository drawRepository;
  private final Clock clock;
  private final LocalTime windowStart;
  private final LocalTime windowEnd;
  private final Optional<OnDemandDrawBackfillService> backfillService;

  public DrawPollScheduler(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock,
        DEFAULT_WINDOW_START,
        DEFAULT_WINDOW_END,
        Optional.empty());
  }

  public DrawPollScheduler(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      String windowStart,
      String windowEnd) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock,
        LocalTime.parse(windowStart),
        LocalTime.parse(windowEnd),
        Optional.empty());
  }

  @Autowired
  public DrawPollScheduler(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      @Value("${dove.scheduler.window-start:16:10}") String windowStart,
      @Value("${dove.scheduler.window-end:17:30}") String windowEnd,
      Optional<OnDemandDrawBackfillService> backfillService) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock,
        LocalTime.parse(windowStart),
        LocalTime.parse(windowEnd),
        backfillService);
  }

  public DrawPollScheduler(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      LocalTime windowStart,
      LocalTime windowEnd) {
    this(
        ingestUseCase,
        schedulePort,
        drawRepository,
        clock,
        windowStart,
        windowEnd,
        Optional.empty());
  }

  public DrawPollScheduler(
      IngestDrawsUseCase ingestUseCase,
      StationSchedulePort schedulePort,
      DrawRepository drawRepository,
      Clock clock,
      LocalTime windowStart,
      LocalTime windowEnd,
      Optional<OnDemandDrawBackfillService> backfillService) {
    this.ingestUseCase = ingestUseCase;
    this.schedulePort = schedulePort;
    this.drawRepository = drawRepository;
    this.clock = clock;
    this.windowStart = windowStart;
    this.windowEnd = windowEnd;
    this.backfillService = backfillService != null ? backfillService : Optional.empty();
  }

  @Scheduled(
      cron = "${dove.scheduler.cron:0 */5 16-17 * * *}",
      zone = "${dove.scheduler.zone:Asia/Ho_Chi_Minh}")
  public void pollScheduledDraws() {
    ZonedDateTime now = ZonedDateTime.now(clock);
    LocalTime currentTime = now.toLocalTime();
    LocalDate today = now.toLocalDate();

    if (!isWithinWindow(currentTime)) {
      log.debug(
          "Thời gian hiện tại ({}) ngoài khung giờ quay số ({} - {}), bỏ qua poll",
          currentTime,
          windowStart,
          windowEnd);
      return;
    }

    backfillService.ifPresent(s -> s.ensureDateIngested(today.minusDays(1)));

    if (areAllStationsComplete(today)) {
      log.info("Tất cả các đài trong ngày [{}] đã có đủ 18 số mở thưởng, dừng poll", today);
      return;
    }

    log.info("Bắt đầu chu kỳ poll kết quả xổ số ngày [{}] lúc {}", today, currentTime);
    ingestUseCase.ingestForDate(today);
  }

  public boolean isWithinWindow(LocalTime time) {
    return !time.isBefore(windowStart) && !time.isAfter(windowEnd);
  }

  public boolean areAllStationsComplete(LocalDate date) {
    List<String> stations = schedulePort.getDrawingStationCodes(date);
    if (stations.isEmpty()) {
      return true;
    }
    return stations.stream()
        .allMatch(
            code ->
                drawRepository
                    .findByStationAndDate(code, date)
                    .map(DrawResult::isComplete)
                    .orElse(false));
  }

  public LocalTime getWindowStart() {
    return windowStart;
  }

  public LocalTime getWindowEnd() {
    return windowEnd;
  }
}
