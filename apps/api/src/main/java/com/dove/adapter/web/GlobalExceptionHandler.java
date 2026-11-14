package com.dove.adapter.web;

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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Global exception handler providing RFC 7807 Problem Details with custom "code" property. */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
    problemDetail.setProperty("code", "INVALID_REQUEST");
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
