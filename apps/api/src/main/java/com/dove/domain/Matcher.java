package com.dove.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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

  /**
   * Matches a ticket against the 9 standard drawn prize tiers (SPECIAL through EIGHTH). Evaluates
   * every drawn number individually.
   *
   * @param ticket the ticket number to check
   * @param drawResult the draw result to match against
   * @param prizeTable the prize money table
   * @return list of Win objects for all matching standard numbers
   */
  public static List<Win> matchStandardTiers(
      TicketNumber ticket, DrawResult drawResult, PrizeTable prizeTable) {
    Objects.requireNonNull(ticket, "ticket không được null");
    Objects.requireNonNull(drawResult, "drawResult không được null");
    Objects.requireNonNull(prizeTable, "prizeTable không được null");

    List<Win> wins = new ArrayList<>();
    for (PrizeTier tier : PrizeTier.values()) {
      if (tier.isDerived()) {
        continue;
      }
      List<String> drawnNumbers = drawResult.getNumbers(tier);
      for (String drawnNumber : drawnNumbers) {
        if (suffixMatches(ticket, drawnNumber, tier.digits())) {
          wins.add(new Win(tier, drawnNumber, prizeTable.getPrizeMoney(tier)));
        }
      }
    }
    return Collections.unmodifiableList(wins);
  }

  /**
   * Checks if a ticket wins the Special Consolation Prize (Giải phụ đặc biệt).
   *
   * <p>Rule: Matches the last 5 digits of the Special prize number, but the first digit is
   * different.
   *
   * @param ticket the ticket number
   * @param specialNumber the 6-digit special prize number
   * @return true if matches Special Consolation Prize, false otherwise
   */
  public static boolean isSpecialConsolation(TicketNumber ticket, String specialNumber) {
    if (ticket == null || specialNumber == null || specialNumber.length() != 6) {
      return false;
    }
    String ticketStr = ticket.value();
    if (ticketStr.length() != 6) {
      return false;
    }
    boolean firstDigitDiffers = ticketStr.charAt(0) != specialNumber.charAt(0);
    boolean lastFiveMatch = ticketStr.substring(1).equals(specialNumber.substring(1));
    return firstDigitDiffers && lastFiveMatch;
  }

  /**
   * Matches a ticket against the Special Consolation Prize tier.
   *
   * @param ticket the ticket number to check
   * @param drawResult the draw result to match against
   * @param prizeTable the prize money table
   * @return an Optional containing Win if matched, empty otherwise
   */
  public static Optional<Win> matchSpecialConsolation(
      TicketNumber ticket, DrawResult drawResult, PrizeTable prizeTable) {
    Objects.requireNonNull(ticket, "ticket không được null");
    Objects.requireNonNull(drawResult, "drawResult không được null");
    Objects.requireNonNull(prizeTable, "prizeTable không được null");

    Optional<String> specialOpt = drawResult.getSpecialNumber();
    if (specialOpt.isEmpty()) {
      return Optional.empty();
    }
    String specialNumber = specialOpt.get();
    if (isSpecialConsolation(ticket, specialNumber)) {
      return Optional.of(
          new Win(
              PrizeTier.SPECIAL_CONSOLATION,
              specialNumber,
              prizeTable.getPrizeMoney(PrizeTier.SPECIAL_CONSOLATION)));
    }
    return Optional.empty();
  }
}
