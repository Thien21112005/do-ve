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

  /**
   * Checks if a ticket wins the Encouragement Prize (Giải khuyến khích).
   *
   * <p>Rule: Matches the first digit of the Special prize number, and differs by exactly 1 digit in
   * the remaining 5 positions (indices 1 through 5).
   *
   * @param ticket the ticket number
   * @param specialNumber the 6-digit special prize number
   * @return true if matches Encouragement Prize, false otherwise
   */
  public static boolean isEncouragement(TicketNumber ticket, String specialNumber) {
    if (ticket == null || specialNumber == null || specialNumber.length() != 6) {
      return false;
    }
    String ticketStr = ticket.value();
    if (ticketStr.length() != 6) {
      return false;
    }
    if (ticketStr.charAt(0) != specialNumber.charAt(0)) {
      return false;
    }

    int diffCount = 0;
    for (int i = 1; i < 6; i++) {
      if (ticketStr.charAt(i) != specialNumber.charAt(i)) {
        diffCount++;
      }
    }
    return diffCount == 1;
  }

  /**
   * Matches a ticket against the Encouragement Prize tier.
   *
   * @param ticket the ticket number to check
   * @param drawResult the draw result to match against
   * @param prizeTable the prize money table
   * @return an Optional containing Win if matched, empty otherwise
   */
  public static Optional<Win> matchEncouragement(
      TicketNumber ticket, DrawResult drawResult, PrizeTable prizeTable) {
    Objects.requireNonNull(ticket, "ticket không được null");
    Objects.requireNonNull(drawResult, "drawResult không được null");
    Objects.requireNonNull(prizeTable, "prizeTable không được null");

    Optional<String> specialOpt = drawResult.getSpecialNumber();
    if (specialOpt.isEmpty()) {
      return Optional.empty();
    }
    String specialNumber = specialOpt.get();
    if (isEncouragement(ticket, specialNumber)) {
      return Optional.of(
          new Win(
              PrizeTier.ENCOURAGEMENT,
              specialNumber,
              prizeTable.getPrizeMoney(PrizeTier.ENCOURAGEMENT)));
    }
    return Optional.empty();
  }

  /**
   * Evaluates a ticket against a draw result and prize table according to Southern lottery rules
   * (BR-01..04).
   *
   * <p>Aggregates all matching standard tiers and derived special consolation/encouragement prizes.
   *
   * @param ticket the ticket number
   * @param drawResult the draw result
   * @param prizeTable the prize table
   * @return comprehensive CheckResult
   */
  public static CheckResult checkTicket(
      TicketNumber ticket, DrawResult drawResult, PrizeTable prizeTable) {
    Objects.requireNonNull(ticket, "ticket không được null");
    Objects.requireNonNull(drawResult, "drawResult không được null");
    Objects.requireNonNull(prizeTable, "prizeTable không được null");

    List<Win> wins = new ArrayList<>();

    // 1. Dò các giải thường (SPECIAL, FIRST..EIGHTH)
    List<Win> standardWins = matchStandardTiers(ticket, drawResult, prizeTable);
    wins.addAll(standardWins);

    boolean hasSpecialWin = standardWins.stream().anyMatch(w -> w.tier() == PrizeTier.SPECIAL);

    // 2. BR-04: SPECIAL, SPECIAL_CONSOLATION và ENCOURAGEMENT loại trừ lẫn nhau
    if (!hasSpecialWin) {
      Optional<Win> specialConsolation = matchSpecialConsolation(ticket, drawResult, prizeTable);
      if (specialConsolation.isPresent()) {
        wins.add(specialConsolation.get());
      } else {
        Optional<Win> encouragement = matchEncouragement(ticket, drawResult, prizeTable);
        encouragement.ifPresent(wins::add);
      }
    }

    return CheckResult.of(ticket, wins);
  }
}
