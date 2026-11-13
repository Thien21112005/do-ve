package com.dove.application;

import java.time.LocalDate;
import java.util.List;

/** Output port for querying which lottery stations are scheduled to draw on a specific date. */
public interface StationSchedulePort {

  /**
   * Retrieves the list of station codes scheduled to draw on the given date.
   *
   * @param drawDate the draw date
   * @return list of station codes (e.g. ["tp-hcm", "dong-thap", "ca-mau"])
   */
  List<String> getDrawingStationCodes(LocalDate drawDate);
}
