package com.dove.application;

import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Output/Driving port for retrieving lottery draw results from an external data source (e.g., web
 * scraper, third-party provider, or mock fixture). Decoupled from transport and parsing details
 * (Hexagonal Architecture).
 */
public interface ResultSource {

  /**
   * Fetches the draw result for a specific station code and draw date.
   *
   * @param stationCode the station slug code (e.g., "tp-hcm", "dong-nai")
   * @param drawDate the date of the draw
   * @return an {@link Optional} containing the domain {@link DrawResult} if found and parsed, or
   *     empty if not available
   */
  Optional<DrawResult> fetch(String stationCode, LocalDate drawDate);
}
