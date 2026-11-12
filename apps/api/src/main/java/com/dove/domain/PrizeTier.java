package com.dove.domain;

/**
 * Prize tiers for Southern Vietnam traditional lottery (XSKT Miền Nam).
 *
 * <p>Comprises 9 directly drawn tiers totaling 18 winning numbers per draw, plus 2 derived tiers
 * (Phụ đặc biệt and Khuyến khích) computed against the Special Prize number.
 */
public enum PrizeTier {
  SPECIAL("Giải đặc biệt", 1, 6, false),
  FIRST("Giải nhất", 1, 5, false),
  SECOND("Giải nhì", 1, 5, false),
  THIRD("Giải ba", 2, 5, false),
  FOURTH("Giải tư", 7, 5, false),
  FIFTH("Giải năm", 1, 4, false),
  SIXTH("Giải sáu", 3, 4, false),
  SEVENTH("Giải bảy", 1, 3, false),
  EIGHTH("Giải tám", 1, 2, false),
  SPECIAL_CONSOLATION("Giải phụ đặc biệt", 0, 6, true),
  ENCOURAGEMENT("Giải khuyến khích", 0, 6, true);

  private final String displayName;
  private final int drawCount;
  private final int digits;
  private final boolean derived;

  PrizeTier(String displayName, int drawCount, int digits, boolean derived) {
    this.displayName = displayName;
    this.drawCount = drawCount;
    this.digits = digits;
    this.derived = derived;
  }

  public String displayName() {
    return displayName;
  }

  public int drawCount() {
    return drawCount;
  }

  public int digits() {
    return digits;
  }

  public boolean isDerived() {
    return derived;
  }

  public boolean isDrawn() {
    return !derived;
  }
}
