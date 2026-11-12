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

  /**
   * Validates that this DrawResult conforms strictly to the Southern lottery structure: exactly 9
   * drawn tiers, each with the exact expected draw count and digit lengths, containing only digits,
   * totaling exactly 18 winning numbers.
   *
   * @throws InvalidDrawResultException if any structural rule is violated
   */
  public void validate() {
    int totalCount = 0;
    for (PrizeTier tier : PrizeTier.values()) {
      if (tier.isDerived()) {
        if (numbers.containsKey(tier) && !numbers.get(tier).isEmpty()) {
          throw new InvalidDrawResultException(
              "Kỳ quay không được chứa giải suy diễn ("
                  + tier.displayName()
                  + ") trong bộ số mở thưởng");
        }
        continue;
      }

      List<String> tierNumbers = numbers.get(tier);
      if (tierNumbers == null || tierNumbers.size() != tier.drawCount()) {
        int actual = tierNumbers == null ? 0 : tierNumbers.size();
        throw new InvalidDrawResultException(
            "Giải "
                + tier.displayName()
                + " yêu cầu đúng "
                + tier.drawCount()
                + " số, nhận được "
                + actual);
      }

      for (String num : tierNumbers) {
        if (num == null
            || num.length() != tier.digits()
            || !num.chars().allMatch(Character::isDigit)) {
          throw new InvalidDrawResultException(
              "Số trúng "
                  + num
                  + " của giải "
                  + tier.displayName()
                  + " không hợp lệ (phải đúng "
                  + tier.digits()
                  + " chữ số)");
        }
      }
      totalCount += tierNumbers.size();
    }

    if (totalCount != 18) {
      throw new InvalidDrawResultException(
          "Tổng số trúng của kỳ quay phải đủ 18 số, hiện có: " + totalCount);
    }
  }

  /**
   * Checks whether this draw result has all 18 valid winning numbers without throwing an exception.
   */
  public boolean isComplete() {
    try {
      validate();
      return true;
    } catch (InvalidDrawResultException e) {
      return false;
    }
  }
}
