package com.dove.domain;

/** Exception thrown when a draw result structure is incomplete or malformed. */
public class InvalidDrawResultException extends RuntimeException {
  public InvalidDrawResultException(String message) {
    super(message);
  }
}
