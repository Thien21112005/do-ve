package com.dove.adapter.web.dto;

import java.time.LocalDate;
import java.util.List;

/** Response DTO for batch check containing individual outcomes and aggregate total. */
public record BatchCheckResponse(
    String stationCode,
    String stationName,
    LocalDate drawDate,
    List<CheckTicketResponse> results,
    long totalAmount) {

  public static BatchCheckResponse of(
      String stationCode,
      String stationName,
      LocalDate drawDate,
      List<CheckTicketResponse> results) {
    long total = results.stream().mapToLong(CheckTicketResponse::totalAmount).sum();
    return new BatchCheckResponse(stationCode, stationName, drawDate, results, total);
  }

  public static BatchCheckResponse of(
      String stationCode, LocalDate drawDate, List<CheckTicketResponse> results) {
    return of(stationCode, null, drawDate, results);
  }
}
