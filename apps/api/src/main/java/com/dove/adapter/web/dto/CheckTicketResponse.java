package com.dove.adapter.web.dto;

import com.dove.domain.CheckOutcome;
import com.dove.domain.CheckStatus;
import java.time.LocalDate;
import java.util.List;

/** DTO for ticket check response conforming to SRS 6.2. */
public record CheckTicketResponse(
    String ticket,
    String stationCode,
    String stationName,
    LocalDate drawDate,
    String status,
    Boolean won,
    List<WinResponse> wins,
    long totalAmount) {

  public static CheckTicketResponse from(CheckOutcome outcome, String stationName) {
    if (outcome.status() == CheckStatus.RESULT_NOT_AVAILABLE) {
      return new CheckTicketResponse(
          outcome.ticket().value(),
          outcome.stationCode(),
          stationName,
          outcome.drawDate(),
          outcome.status().name(),
          null,
          List.of(),
          0L);
    }

    boolean won = outcome.result() != null && outcome.result().isWon();
    List<WinResponse> winResponses =
        outcome.result() != null
            ? outcome.result().wins().stream().map(WinResponse::from).toList()
            : List.of();
    long total = outcome.result() != null ? outcome.result().totalAmount().vnd() : 0L;

    return new CheckTicketResponse(
        outcome.ticket().value(),
        outcome.stationCode(),
        stationName,
        outcome.drawDate(),
        outcome.status().name(),
        won,
        winResponses,
        total);
  }

  public static CheckTicketResponse from(CheckOutcome outcome) {
    return from(outcome, null);
  }
}
