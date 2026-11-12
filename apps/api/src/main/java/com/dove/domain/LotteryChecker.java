package com.dove.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Main domain facade for checking lottery tickets against Southern Vietnam draw results.
 *
 * <p>Encapsulates all business rules (BR-01 through BR-06), structural draw validation, and prize
 * calculation into a single, straightforward entry point.
 */
public final class LotteryChecker {

  private LotteryChecker() {
    // Utility facade
  }

  /**
   * Checks a ticket against a draw result and prize table.
   *
   * <p>If the draw result is null or incomplete (does not have all 18 valid drawn winning numbers),
   * returns {@link CheckStatus#RESULT_NOT_AVAILABLE} to prevent falsely reporting lost tickets
   * (BR-06).
   *
   * @param ticket the validated 6-digit ticket
   * @param drawResult the draw result (may be incomplete or null)
   * @param prizeTable the table of prize amounts
   * @return comprehensive {@link CheckOutcome}
   */
  public static CheckOutcome check(
      TicketNumber ticket, DrawResult drawResult, PrizeTable prizeTable) {
    Objects.requireNonNull(ticket, "ticket không được null");
    PrizeTable effectiveTable = prizeTable != null ? prizeTable : PrizeTable.southDefault();

    if (drawResult == null || !drawResult.isComplete()) {
      String station = drawResult != null ? drawResult.stationCode() : "unknown";
      java.time.LocalDate date =
          drawResult != null ? drawResult.drawDate() : java.time.LocalDate.now();
      return CheckOutcome.notAvailable(ticket, station, date, null);
    }

    CheckResult result = Matcher.checkTicket(ticket, drawResult, effectiveTable);
    return CheckOutcome.checked(ticket, drawResult.stationCode(), drawResult.drawDate(), result);
  }

  /** Checks a ticket using the default Southern prize amounts. */
  public static CheckOutcome check(TicketNumber ticket, DrawResult drawResult) {
    return check(ticket, drawResult, PrizeTable.southDefault());
  }

  /** Normalizes a raw string ticket (e.g. " 123-456 ") and checks against a draw result. */
  public static CheckOutcome check(String rawTicket, DrawResult drawResult) {
    TicketNumber ticket = TicketNumber.parse(rawTicket);
    return check(ticket, drawResult);
  }

  /**
   * Evaluates multiple tickets against a single draw result in one call.
   *
   * @param tickets list of tickets (up to 20 per request per SRS)
   * @param drawResult the draw result
   * @param prizeTable the prize table
   * @return list of check outcomes in the same order as input tickets
   */
  public static List<CheckOutcome> checkMany(
      List<TicketNumber> tickets, DrawResult drawResult, PrizeTable prizeTable) {
    Objects.requireNonNull(tickets, "danh sách vé không được null");
    List<CheckOutcome> outcomes = new ArrayList<>(tickets.size());
    for (TicketNumber ticket : tickets) {
      outcomes.add(check(ticket, drawResult, prizeTable));
    }
    return Collections.unmodifiableList(outcomes);
  }
}
