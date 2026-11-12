package com.dove.domain;

import java.util.regex.Pattern;

/**
 * Immutable value object representing a 6-digit Southern Vietnam lottery ticket number. Preserves
 * leading zeros (e.g. "012345").
 */
public record TicketNumber(String value) {
  private static final Pattern SIX_DIGITS = Pattern.compile("^\\d{6}$");

  public TicketNumber {
    if (value == null || !SIX_DIGITS.matcher(value).matches()) {
      throw new InvalidTicketException("Số vé phải là chuỗi đúng 6 chữ số: " + value);
    }
  }

  @Override
  public String toString() {
    return value;
  }
}
