package com.dove.adapter.source;

/** Exception thrown when HTML lottery content cannot be parsed into a valid DrawResult. */
public class DrawParseException extends RuntimeException {

  public DrawParseException(String message) {
    super(message);
  }

  public DrawParseException(String message, Throwable cause) {
    super(message, cause);
  }
}
