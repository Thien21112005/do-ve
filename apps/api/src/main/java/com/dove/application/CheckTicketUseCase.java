package com.dove.application;

import com.dove.application.CheckRejectedException.Reason;
import com.dove.domain.CheckOutcome;
import com.dove.domain.DrawResult;
import com.dove.domain.LotteryChecker;
import com.dove.domain.PrizeTable;
import com.dove.domain.TicketNumber;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Application use case for evaluating lottery tickets against draw results. Depends only on ports
 * and the domain; refusals are reported as {@link CheckRejectedException} (T13.10).
 */
@Service
public class CheckTicketUseCase {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private final DrawRepository drawRepository;
  private final StationSchedulePort stationSchedulePort;
  private final StationLookupPort stationLookup;
  private final Clock clock;
  private final Optional<OnDemandDrawBackfillService> backfillService;

  @Autowired
  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationLookupPort stationLookup,
      Optional<Clock> clock,
      Optional<OnDemandDrawBackfillService> backfillService) {
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.stationSchedulePort =
        Objects.requireNonNull(stationSchedulePort, "stationSchedulePort must not be null");
    this.stationLookup = Objects.requireNonNull(stationLookup, "stationLookup must not be null");
    this.clock = clock.orElseGet(() -> Clock.system(VN_ZONE));
    this.backfillService =
        Objects.requireNonNull(backfillService, "backfillService must not be null");
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationLookupPort stationLookup,
      Optional<Clock> clock) {
    this(drawRepository, stationSchedulePort, stationLookup, clock, Optional.empty());
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationLookupPort stationLookup) {
    this(drawRepository, stationSchedulePort, stationLookup, Optional.empty(), Optional.empty());
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationLookupPort stationLookup,
      Clock clock) {
    this(
        drawRepository,
        stationSchedulePort,
        stationLookup,
        Optional.ofNullable(clock),
        Optional.empty());
  }

  public CheckOutcome check(TicketNumber ticket, String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(ticket, "ticket must not be null");
    Optional<DrawResult> draw = loadCompleteDraw(stationCode, drawDate);
    if (draw.isEmpty()) {
      return CheckOutcome.notAvailable(ticket, stationCode, drawDate, null);
    }
    return LotteryChecker.check(ticket, draw.get());
  }

  public List<CheckOutcome> checkBatch(
      List<TicketNumber> tickets, String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(tickets, "tickets must not be null");
    Optional<DrawResult> draw = loadCompleteDraw(stationCode, drawDate);
    if (draw.isEmpty()) {
      return tickets.stream()
          .map(t -> CheckOutcome.notAvailable(t, stationCode, drawDate, null))
          .toList();
    }
    return LotteryChecker.checkMany(tickets, draw.get(), PrizeTable.southDefault());
  }

  /**
   * Validates the request, then returns the stored draw if it has all 18 numbers, lazily
   * backfilling a missing past draw first (T12.02). Empty means "result not available yet".
   */
  private Optional<DrawResult> loadCompleteDraw(String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(stationCode, "stationCode must not be null");
    Objects.requireNonNull(drawDate, "drawDate must not be null");

    LocalDate todayVn = LocalDate.now(clock.withZone(VN_ZONE));
    if (drawDate.isAfter(todayVn)) {
      throw new CheckRejectedException(Reason.DATE_IN_FUTURE, stationCode, drawDate);
    }
    if (!stationLookup.stationExists(stationCode)) {
      throw new CheckRejectedException(Reason.STATION_NOT_FOUND, stationCode, drawDate);
    }
    if (!stationSchedulePort.getDrawingStationCodes(drawDate).contains(stationCode)) {
      throw new CheckRejectedException(Reason.STATION_NOT_DRAWING, stationCode, drawDate);
    }

    Optional<DrawResult> draw = drawRepository.findByStationAndDate(stationCode, drawDate);
    if ((draw.isEmpty() || !draw.get().isComplete()) && backfillService.isPresent()) {
      backfillService.get().ensureDateIngestedForRequest(drawDate);
      draw = drawRepository.findByStationAndDate(stationCode, drawDate);
    }
    return draw.filter(DrawResult::isComplete);
  }
}
