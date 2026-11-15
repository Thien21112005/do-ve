package com.dove.application;

import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Output port for saving and querying lottery draw results. Decoupled from any database or ORM
 * framework (Hexagonal Architecture).
 */
public interface DrawRepository {

  /**
   * Finds the draw result for a given station code and date.
   *
   * @param stationCode the station slug code (e.g. "tp-hcm")
   * @param drawDate the draw date
   * @return optional containing the domain model if found
   */
  Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate);

  /**
   * Finds the latest draw result for a specific station.
   *
   * @param stationCode the station slug code
   * @return optional containing the latest draw if found
   */
  Optional<DrawResult> findLatestByStation(String stationCode);

  /**
   * Finds the latest draw result across all stations.
   *
   * @return optional containing the overall latest draw if found
   */
  Optional<DrawResult> findLatestOverall();

  /**
   * Finds all draw results for a given draw date.
   *
   * @param drawDate the draw date
   * @return list of draw results on that date
   */
  default java.util.List<DrawResult> findByDrawDate(LocalDate drawDate) {
    return java.util.List.of();
  }

  /**
   * Finds all draw results for the most recent draw date in the database.
   *
   * @return list of draw results on the latest draw date, or empty list if no draws exist
   */
  default java.util.List<DrawResult> findLatestDayDraws() {
    return java.util.List.of();
  }

  /**
   * Saves a draw result.
   *
   * @param drawResult the domain model
   * @param source source identifier (e.g. "SCRAPER", "MANUAL")
   * @return the saved domain model
   */
  DrawResult save(DrawResult drawResult, String source);

  /**
   * Idempotently saves a draw result if not already present for (station, drawDate).
   *
   * @param drawResult the domain model to save
   * @param source source identifier
   * @return true if newly saved, false if already existed
   */
  boolean saveIfAbsent(DrawResult drawResult, String source);
}
