package com.dove.domain;

/** Exception thrown when a ticket number string does not conform to Southern lottery standards. */
public class InvalidTicketException extends RuntimeException {
  public InvalidTicketException(String message) {
    super(message);
  }
}
