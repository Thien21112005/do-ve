package com.dove.application;

/** Port for asking whether a station code is known (implemented by the persistence adapter). */
@FunctionalInterface
public interface StationLookupPort {

  /** Returns true when {@code stationCode} is a known station. */
  boolean stationExists(String stationCode);
}
