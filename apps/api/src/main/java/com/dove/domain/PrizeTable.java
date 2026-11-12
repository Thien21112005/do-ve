package com.dove.domain;

import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;

/** Immutable mapping of lottery prize tiers to their monetary reward amounts. */
public final class PrizeTable {

  private final Map<PrizeTier, Money> table;

  public PrizeTable(Map<PrizeTier, Money> amounts) {
    Objects.requireNonNull(amounts, "amounts map không được null");
    Map<PrizeTier, Money> copy = new EnumMap<>(PrizeTier.class);
    amounts.forEach(
        (tier, money) -> {
          if (tier != null && money != null) {
            copy.put(tier, money);
          }
        });
    this.table = Collections.unmodifiableMap(copy);
  }

  /**
   * Default prize table for Southern Vietnam traditional lottery (XSKT Miền Nam) as specified in
   * section 3.1 of the SRS.
   */
  public static PrizeTable southDefault() {
    Map<PrizeTier, Money> map = new EnumMap<>(PrizeTier.class);
    map.put(PrizeTier.SPECIAL, Money.of(2_000_000_000L));
    map.put(PrizeTier.FIRST, Money.of(30_000_000L));
    map.put(PrizeTier.SECOND, Money.of(15_000_000L));
    map.put(PrizeTier.THIRD, Money.of(10_000_000L));
    map.put(PrizeTier.FOURTH, Money.of(3_000_000L));
    map.put(PrizeTier.FIFTH, Money.of(1_000_000L));
    map.put(PrizeTier.SIXTH, Money.of(400_000L));
    map.put(PrizeTier.SEVENTH, Money.of(200_000L));
    map.put(PrizeTier.EIGHTH, Money.of(100_000L));
    map.put(PrizeTier.SPECIAL_CONSOLATION, Money.of(50_000_000L));
    map.put(PrizeTier.ENCOURAGEMENT, Money.of(6_000_000L));
    return new PrizeTable(map);
  }

  /**
   * Retrieves the prize money for the specified tier. If not configured, returns Money.ZERO.
   *
   * @param tier the prize tier
   * @return monetary amount
   */
  public Money getPrizeMoney(PrizeTier tier) {
    return table.getOrDefault(tier, Money.ZERO);
  }

  public Map<PrizeTier, Money> asMap() {
    return table;
  }
}
