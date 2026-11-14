package com.dove.adapter.web.error;

/** Thrown when a station code is not recognized. */
public class StationNotFoundException extends BusinessException {

  public StationNotFoundException(String stationCode) {
    super(ErrorCode.STATION_NOT_FOUND, "Không tìm thấy đài với mã: " + stationCode);
  }
}
