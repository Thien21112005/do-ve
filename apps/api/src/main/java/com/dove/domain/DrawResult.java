package com.dove.domain;

import java.time.LocalDate;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Immutable model representing the outcome of a Southern Vietnam lottery draw for a specific
 * station on a given date.
 */
public record DrawResult(
    String stationCode, LocalDate drawDate, Map<PrizeTier, List<String>> numbers) {

  public DrawResult {
    Objects.requireNonNull(stationCode, "stationCode không được null");
    if (stationCode.isBlank()) {
      throw new IllegalArgumentException("stationCode không được rỗng");
    }
    Objects.requireNonNull(drawDate, "drawDate không được null");

    Map<PrizeTier, List<String>> deepCopy = new EnumMap<>(PrizeTier.class);
    if (numbers != null) {
      numbers.forEach(
          (tier, list) -> {
            if (tier != null && list != null) {
              deepCopy.put(tier, List.copyOf(list));
            }
          });
    }
    numbers = Collections.unmodifiableMap(deepCopy);
  }

  /**
   * Returns an unmodifiable list of winning numbers for the given prize tier.
   *
   * @param tier the prize tier
   * @return list of prize number strings, or an empty list if tier has no numbers
   */
  public List<String> getNumbers(PrizeTier tier) {
    return numbers.getOrDefault(tier, List.of());
  }

  /** Helper returning the Special Prize number if present. */
  public Optional<String> getSpecialNumber() {
    List<String> special = getNumbers(PrizeTier.SPECIAL);
    return special.isEmpty() ? Optional.empty() : Optional.of(special.getFirst());
  }
}
