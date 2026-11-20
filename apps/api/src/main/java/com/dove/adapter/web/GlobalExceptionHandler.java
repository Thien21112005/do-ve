package com.dove.adapter.web;

import com.dove.adapter.web.error.BusinessException;
import com.dove.adapter.web.error.ErrorCode;
import com.dove.adapter.web.error.InvalidDateException;
import com.dove.adapter.web.error.StationNotDrawingException;
import com.dove.adapter.web.error.StationNotFoundException;
import com.dove.application.CheckRejectedException;
import com.dove.domain.InvalidTicketException;
import java.net.URI;
import java.time.Instant;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Global exception handler providing RFC 7807 Problem Details with custom "code" property. */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ProblemDetail handleMethodArgumentTypeMismatch(
      MethodArgumentTypeMismatchException ex, WebRequest request) {
    String paramName = ex.getName();
    String sanitizedValue = sanitizeValue(ex.getValue());
    String code = "INVALID_REQUEST";
    String detail = "Tham số '" + paramName + "' không hợp lệ: " + sanitizedValue;

    if ("date".equalsIgnoreCase(paramName) || "drawDate".equalsIgnoreCase(paramName)) {
      code = ErrorCode.INVALID_DATE.name();
      detail = "Ngày sai định dạng: " + sanitizedValue;
    }

    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    problemDetail.setTitle("Bad Request");
    problemDetail.setProperty("code", code);
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);
    return problemDetail;
  }

  private String sanitizeValue(Object value) {
    if (value == null) {
      return "null";
    }
    String str = value.toString().replaceAll("[\r\n\t]", "_");
    if (str.length() > 64) {
      return str.substring(0, 64) + "...";
    }
    return str;
  }

  /** Maps application-level check refusals to the same Problem Details as before (T13.10). */
  @ExceptionHandler(CheckRejectedException.class)
  public ProblemDetail handleCheckRejected(CheckRejectedException ex, WebRequest request) {
    BusinessException translated =
        switch (ex.reason()) {
          case DATE_IN_FUTURE ->
              new InvalidDateException("Ngày dò không thể ở tương lai: " + ex.drawDate());
          case STATION_NOT_FOUND -> new StationNotFoundException(ex.stationCode());
          case STATION_NOT_DRAWING ->
              new StationNotDrawingException(ex.stationCode(), ex.drawDate());
        };
    return handleBusinessException(translated, request);
  }

  @ExceptionHandler(BusinessException.class)
  public ProblemDetail handleBusinessException(BusinessException ex, WebRequest request) {
    ErrorCode errorCode = ex.getErrorCode();
    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(errorCode.getHttpStatus(), ex.getMessage());
    problemDetail.setTitle(errorCode.getHttpStatus().getReasonPhrase());
    problemDetail.setProperty("code", errorCode.name());
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);
    return problemDetail;
  }

  @ExceptionHandler(InvalidTicketException.class)
  public ProblemDetail handleInvalidTicketException(InvalidTicketException ex, WebRequest request) {
    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    problemDetail.setTitle(HttpStatus.BAD_REQUEST.getReasonPhrase());
    problemDetail.setProperty("code", ErrorCode.INVALID_TICKET.name());
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);
    return problemDetail;
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ProblemDetail handleResponseStatusException(
      ResponseStatusException ex, WebRequest request) {
    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason());
    problemDetail.setTitle(ex.getStatusCode().toString());
    problemDetail.setProperty("code", ex.getStatusCode().toString());
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);
    return problemDetail;
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {

    String detail =
        ex.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining("; "));
    if (detail.isBlank()) {
      detail = "Validation failed";
    }

    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    problemDetail.setTitle("Bad Request");

    String code = "INVALID_REQUEST";
    boolean hasTicketError =
        ex.getBindingResult().getFieldErrors().stream()
            .anyMatch(
                err -> {
                  String field = err.getField();
                  return field != null
                      && ("ticket".equalsIgnoreCase(field)
                          || field.equalsIgnoreCase("tickets")
                          || field.startsWith("tickets["));
                });
    boolean hasDateError =
        ex.getBindingResult().getFieldErrors().stream()
            .anyMatch(
                err ->
                    "drawDate".equalsIgnoreCase(err.getField())
                        || "date".equalsIgnoreCase(err.getField()));

    if (hasTicketError) {
      code = ErrorCode.INVALID_TICKET.name();
    } else if (hasDateError) {
      code = ErrorCode.INVALID_DATE.name();
    }

    problemDetail.setProperty("code", code);
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
  }

  @Override
  protected ResponseEntity<Object> handleHttpMessageNotReadable(
      org.springframework.http.converter.HttpMessageNotReadableException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {

    String code = "INVALID_REQUEST";
    String detail = "Dữ liệu JSON không hợp lệ hoặc sai cấu trúc";

    Throwable root = ex.getMostSpecificCause();
    if (root instanceof java.time.format.DateTimeParseException
        || (root != null
            && root.getMessage() != null
            && (root.getMessage().contains("LocalDate")
                || root.getMessage().contains("DateTimeParseException")))) {
      code = ErrorCode.INVALID_DATE.name();
      detail = "Ngày sai định dạng: yêu cầu định dạng chuẩn YYYY-MM-DD";
    }

    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    problemDetail.setTitle("Bad Request");
    problemDetail.setProperty("code", code);
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
  }

  @Override
  protected ResponseEntity<Object> handleMissingServletRequestParameter(
      org.springframework.web.bind.MissingServletRequestParameterException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {

    String paramName = ex.getParameterName();
    String detail = "Thiếu tham số bắt buộc: " + paramName;

    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    problemDetail.setTitle("Bad Request");
    problemDetail.setProperty("code", "MISSING_PARAMETER");
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ProblemDetail handleIllegalArgumentException(
      IllegalArgumentException ex, WebRequest request) {
    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    problemDetail.setTitle("Bad Request");
    problemDetail.setProperty("code", "INVALID_ARGUMENT");
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);
    return problemDetail;
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handleAllUncaughtException(Exception ex, WebRequest request) {
    log.error("Unhandled server exception: {}", ex.getMessage(), ex);
    ProblemDetail problemDetail =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    problemDetail.setTitle("Internal Server Error");
    problemDetail.setProperty("code", "INTERNAL_ERROR");
    problemDetail.setProperty("timestamp", Instant.now());
    enrichInstance(problemDetail, request);
    return problemDetail;
  }

  private void enrichInstance(ProblemDetail problemDetail, WebRequest request) {
    if (request instanceof ServletWebRequest servletWebRequest) {
      problemDetail.setInstance(URI.create(servletWebRequest.getRequest().getRequestURI()));
    }
  }
}
