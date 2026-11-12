package com.dove.domain;

/** Utility methods for lottery number matching algorithms. */
public final class Matcher {

  private Matcher() {
    // Utility class
  }

  /**
   * Checks if the last {@code digits} characters of the ticket string match the last {@code digits}
   * characters of the prize number string.
   *
   * <p>Both strings are compared character-by-character to strictly preserve leading zeros (e.g.
   * "05" != "5").
   *
   * @param ticket the ticket number string
   * @param prizeNumber the drawn winning prize number
   * @param digits the number of suffix digits to compare (must be positive)
   * @return true if suffixes match exactly, false otherwise
   */
  public static boolean suffixMatches(String ticket, String prizeNumber, int digits) {
    if (ticket == null || prizeNumber == null || digits <= 0) {
      return false;
    }
    if (ticket.length() < digits || prizeNumber.length() < digits) {
      return false;
    }
    String ticketSuffix = ticket.substring(ticket.length() - digits);
    String prizeSuffix = prizeNumber.substring(prizeNumber.length() - digits);
    return ticketSuffix.equals(prizeSuffix);
  }

  /** Overloaded helper accepting a domain {@link TicketNumber}. */
  public static boolean suffixMatches(TicketNumber ticket, String prizeNumber, int digits) {
    if (ticket == null) {
      return false;
    }
    return suffixMatches(ticket.value(), prizeNumber, digits);
  }
}
