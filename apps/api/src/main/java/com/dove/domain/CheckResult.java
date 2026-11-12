package com.dove.domain;

import java.util.List;
import java.util.Objects;

/**
 * Aggregated outcome of checking a lottery ticket against a draw result.
 *
 * @param ticket the checked ticket number
 * @param wins immutable list of all winning matches
 * @param totalAmount total accumulated prize money
 */
public record CheckResult(TicketNumber ticket, List<Win> wins, Money totalAmount) {

  public CheckResult {
    Objects.requireNonNull(ticket, "ticket không được null");
    wins = wins == null ? List.of() : List.copyOf(wins);
    if (totalAmount == null) {
      totalAmount = wins.stream().map(Win::prizeAmount).reduce(Money.ZERO, Money::plus);
    }
  }

  public static CheckResult of(TicketNumber ticket, List<Win> wins) {
    Money total =
        wins == null
            ? Money.ZERO
            : wins.stream().map(Win::prizeAmount).reduce(Money.ZERO, Money::plus);
    return new CheckResult(ticket, wins, total);
  }

  /** Returns true if the ticket won at least one prize tier. */
  public boolean isWon() {
    return !wins.isEmpty();
  }

  /** Returns the total number of winning prizes. */
  public int winCount() {
    return wins.size();
  }
}
