package com.dove.application;

import java.time.LocalDate;
import java.util.Objects;

/**
 * A ticket check request the application refuses before looking at any draw. Adapters translate the
 * {@link Reason} to their own error format (the web adapter maps it to RFC 7807 codes).
 */
public class CheckRejectedException extends RuntimeException {

  /** Why the check was refused. */
  public enum Reason {
    DATE_IN_FUTURE,
    STATION_NOT_FOUND,
    STATION_NOT_DRAWING
  }

  private final Reason reason;
  private final String stationCode;
  private final LocalDate drawDate;

  public CheckRejectedException(Reason reason, String stationCode, LocalDate drawDate) {
    super(reason + " (station=" + stationCode + ", date=" + drawDate + ")");
    this.reason = Objects.requireNonNull(reason, "reason must not be null");
    this.stationCode = stationCode;
    this.drawDate = drawDate;
  }

  public Reason reason() {
    return reason;
  }

  public String stationCode() {
    return stationCode;
  }

  public LocalDate drawDate() {
    return drawDate;
  }
}
