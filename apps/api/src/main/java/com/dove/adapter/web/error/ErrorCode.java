package com.dove.adapter.web.error;

import org.springframework.http.HttpStatus;

/** Business error codes matching SRS 6.2 REST API specification. */
public enum ErrorCode {
  INVALID_TICKET(HttpStatus.BAD_REQUEST, "Vé không phải 6 chữ số"),
  INVALID_DATE(HttpStatus.BAD_REQUEST, "Ngày sai định dạng hoặc ở tương lai"),
  STATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Mã đài không tồn tại"),
  STATION_NOT_DRAWING(HttpStatus.UNPROCESSABLE_ENTITY, "Đài không quay vào ngày đó"),
  RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Quá giới hạn");

  private final HttpStatus httpStatus;
  private final String defaultMessage;

  ErrorCode(HttpStatus httpStatus, String defaultMessage) {
    this.httpStatus = httpStatus;
    this.defaultMessage = defaultMessage;
  }

  public HttpStatus getHttpStatus() {
    return httpStatus;
  }

  public String getDefaultMessage() {
    return defaultMessage;
  }
}
