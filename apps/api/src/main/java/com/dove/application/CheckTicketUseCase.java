package com.dove.application;

import com.dove.domain.CheckOutcome;
import com.dove.domain.DrawResult;
import com.dove.domain.LotteryChecker;
import com.dove.domain.TicketNumber;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Application use case for evaluating lottery tickets against draw results. */
@Service
public class CheckTicketUseCase {

  private final DrawRepository drawRepository;

  public CheckTicketUseCase(DrawRepository drawRepository) {
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
  }

  public CheckOutcome check(TicketNumber ticket, String stationCode, LocalDate drawDate) {
    Objects.requireNonNull(ticket, "ticket must not be null");
    Objects.requireNonNull(stationCode, "stationCode must not be null");
    Objects.requireNonNull(drawDate, "drawDate must not be null");

    Optional<DrawResult> drawResult = drawRepository.findByStationAndDate(stationCode, drawDate);
    return LotteryChecker.check(ticket, drawResult.orElse(null));
  }
}
