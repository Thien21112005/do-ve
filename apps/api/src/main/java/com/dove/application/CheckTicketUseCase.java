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

  @Autowired
  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository,
      Optional<Clock> clock) {
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.stationSchedulePort =
        Objects.requireNonNull(stationSchedulePort, "stationSchedulePort must not be null");
    this.stationRepository =
        Objects.requireNonNull(stationRepository, "stationRepository must not be null");
    this.clock = clock.orElseGet(() -> Clock.system(VN_ZONE));
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository) {
    this(drawRepository, stationSchedulePort, stationRepository, Optional.empty());
  }

  public CheckTicketUseCase(
      DrawRepository drawRepository,
      StationSchedulePort stationSchedulePort,
      StationRepository stationRepository,
      Clock clock) {
    this(drawRepository, stationSchedulePort, stationRepository, Optional.ofNullable(clock));
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
    return LotteryChecker.check(ticket, drawResult.orElse(null));
  }
}
