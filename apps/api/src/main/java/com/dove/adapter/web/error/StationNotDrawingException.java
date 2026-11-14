package com.dove.adapter.web.error;

import java.time.LocalDate;

/** Thrown when a station does not draw on the requested date. */
public class StationNotDrawingException extends BusinessException {

  public StationNotDrawingException(String stationCode, LocalDate date) {
    super(
        ErrorCode.STATION_NOT_DRAWING,
        "Đài " + stationCode + " không có lịch quay vào ngày " + date);
  }

  public StationNotDrawingException(String message) {
    super(ErrorCode.STATION_NOT_DRAWING, message);
  }
}
