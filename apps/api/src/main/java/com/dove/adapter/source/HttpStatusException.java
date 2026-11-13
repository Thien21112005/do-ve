package com.dove.adapter.source;

/** Exception thrown when an external HTTP request returns a 4xx or 5xx status code. */
public class HttpStatusException extends RuntimeException {

  private final int statusCode;
  private final String url;

  public HttpStatusException(String message, int statusCode, String url) {
    super(message);
    this.statusCode = statusCode;
    this.url = url;
  }

  public int getStatusCode() {
    return statusCode;
  }

  public String getUrl() {
    return url;
  }

  public boolean isClientError() {
    return statusCode >= 400 && statusCode < 500;
  }

  public boolean isServerError() {
    return statusCode >= 500 && statusCode < 600;
  }
}
