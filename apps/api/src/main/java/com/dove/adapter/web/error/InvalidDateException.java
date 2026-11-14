package com.dove.adapter.web.error;

/** Thrown when drawDate is invalid or in the future. */
public class InvalidDateException extends BusinessException {

  public InvalidDateException(String message) {
    super(ErrorCode.INVALID_DATE, message);
  }

  public InvalidDateException() {
    super(ErrorCode.INVALID_DATE);
  }
}
