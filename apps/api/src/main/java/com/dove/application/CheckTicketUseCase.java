package com.dove.application;

import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.web.error.InvalidDateException;
import com.dove.adapter.web.error.StationNotDrawingException;
import com.dove.adapter.web.error.StationNotFoundException;
import com.dove.domain.CheckOutcome;
import com.dove.domain.DrawResult;
import com.dove.domain.LotteryChecker;
import com.dove.domain.TicketNumber;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** Application use case for evaluating lottery tickets against draw results. */
@Service
public class CheckTicketUseCase {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private final DrawRepository drawRepository;
  private final StationSchedulePort stationSchedulePort;
  private final StationRepository stationRepository;
  private final Clock clock;
  private final Optional<OnDemandDrawBackfillService> backfillService;

  @Autowired
  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository,
      Optional<Clock> clock,
      Optional<OnDemandDrawBackfillService> backfillService) {
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.stationSchedulePort =
        Objects.requireNonNull(stationSchedulePort, "stationSchedulePort must not be null");
    this.stationRepository =
        Objects.requireNonNull(stationRepository, "stationRepository must not be null");
    this.clock = clock.orElseGet(() -> Clock.system(VN_ZONE));
    this.backfillService =
        Objects.requireNonNull(backfillService, "backfillService must not be null");
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository,
      Optional<Clock> clock) {
    this(drawRepository, stationSchedulePort, stationRepository, clock, Optional.empty());
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository) {
    this(
        drawRepository, stationSchedulePort, stationRepository, Optional.empty(), Optional.empty());
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository,
      Clock clock) {
    this(
        drawRepository,
        stationSchedulePort,
        stationRepository,
        Optional.ofNullable(clock),
        Optional.empty());
  }

  public CheckOutcome check(TicketNumber ticket, String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(ticket, "ticket must not be null");
    Objects.requireNonNull(stationCode, "stationCode must not be null");
    Objects.requireNonNull(drawDate, "drawDate must not be null");

    LocalDate todayVn = LocalDate.now(clock.withZone(VN_ZONE));
    if (drawDate.isAfter(todayVn)) {
      throw new InvalidDateException("Ngày dò không thể ở tương lai: " + drawDate);
    }

    if (stationRepository.findByCode(stationCode).isEmpty()) {
      throw new StationNotFoundException(stationCode);
    }

    List<String> drawingStationCodes = stationSchedulePort.getDrawingStationCodes(drawDate);
    if (!drawingStationCodes.contains(stationCode)) {
      throw new StationNotDrawingException(stationCode, drawDate);
    }

    Optional<DrawResult> drawResult = drawRepository.findByStationAndDate(stationCode, drawDate);
    if ((drawResult.isEmpty() || !drawResult.get().isComplete()) && backfillService.isPresent()) {
      backfillService.get().ensureDateIngestedForRequest(drawDate);
      drawResult = drawRepository.findByStationAndDate(stationCode, drawDate);
    }
    if (drawResult.isEmpty() || !drawResult.get().isComplete()) {
      return CheckOutcome.notAvailable(ticket, stationCode, drawDate, null);
    }
    return LotteryChecker.check(ticket, drawResult.get());
  }

  public List<CheckOutcome> checkBatch(
      List<TicketNumber> tickets, String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(tickets, "tickets must not be null");
    Objects.requireNonNull(stationCode, "stationCode must not be null");
    Objects.requireNonNull(drawDate, "drawDate must not be null");

    LocalDate todayVn = LocalDate.now(clock.withZone(VN_ZONE));
    if (drawDate.isAfter(todayVn)) {
      throw new InvalidDateException("Ngày dò không thể ở tương lai: " + drawDate);
    }

    if (stationRepository.findByCode(stationCode).isEmpty()) {
      throw new StationNotFoundException(stationCode);
    }

    List<String> drawingStationCodes = stationSchedulePort.getDrawingStationCodes(drawDate);
    if (!drawingStationCodes.contains(stationCode)) {
      throw new StationNotDrawingException(stationCode, drawDate);
    }

    Optional<DrawResult> drawResult = drawRepository.findByStationAndDate(stationCode, drawDate);
    if ((drawResult.isEmpty() || !drawResult.get().isComplete()) && backfillService.isPresent()) {
      backfillService.get().ensureDateIngestedForRequest(drawDate);
      drawResult = drawRepository.findByStationAndDate(stationCode, drawDate);
    }
    if (drawResult.isEmpty() || !drawResult.get().isComplete()) {
      return tickets.stream()
          .map(t -> CheckOutcome.notAvailable(t, stationCode, drawDate, null))
          .toList();
    }
    return LotteryChecker.checkMany(
        tickets, drawResult.get(), com.dove.domain.PrizeTable.southDefault());
  }
}
