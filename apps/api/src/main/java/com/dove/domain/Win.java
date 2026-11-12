package com.dove.domain;

import java.util.Objects;

/**
 * Represents a single winning prize matched by a ticket against a drawn number.
 *
 * @param tier the prize tier won
 * @param matchedNumber the winning number that matched the ticket
 * @param prizeAmount the prize money awarded for this match
 */
public record Win(PrizeTier tier, String matchedNumber, Money prizeAmount) {

  public Win {
    Objects.requireNonNull(tier, "tier không được null");
    Objects.requireNonNull(matchedNumber, "matchedNumber không được null");
    Objects.requireNonNull(prizeAmount, "prizeAmount không được null");
  }
}
