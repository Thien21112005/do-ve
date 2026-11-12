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

  /**
   * Normalizes raw user input by trimming, stripping whitespace and hyphens, then returns a valid
   * TicketNumber.
   *
   * @param raw the raw ticket input string (e.g. " 123-456 ")
   * @return normalized TicketNumber instance
   * @throws InvalidTicketException if raw is null or resulting digits do not form a 6-digit ticket
   */
  public static TicketNumber parse(String raw) {
    if (raw == null) {
      throw new InvalidTicketException("Số vé không được để trống (null)");
    }
    String normalized = raw.replace("-", "").replaceAll("\\s+", "");
    return new TicketNumber(normalized);
  }

  @Override
  public String toString() {
    return value;
  }
}
