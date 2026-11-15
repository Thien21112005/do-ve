package com.dove.adapter.web.error;

import java.time.LocalDate;

/** Thrown when draw results for a station/date have not been released or ingested yet. */
public class ResultNotAvailableException extends BusinessException {

  public ResultNotAvailableException(String stationCode, LocalDate date) {
    super(
        ErrorCode.RESULT_NOT_AVAILABLE,
        "Chưa có kết quả cho đài " + stationCode + " vào ngày " + date);
  }

  public ResultNotAvailableException(String message) {
    super(ErrorCode.RESULT_NOT_AVAILABLE, message);
  }
}

