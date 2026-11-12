package com.dove.domain;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.Objects;

/** Immutable value object representing a non-negative monetary amount in Vietnamese Dong (VND). */
public record Money(long vnd) implements Comparable<Money> {

  public static final Money ZERO = new Money(0);

  public Money {
    if (vnd < 0) {
      throw new IllegalArgumentException("Số tiền không được âm: " + vnd);
    }
  }

  public static Money of(long vnd) {
    return new Money(vnd);
  }

  /** Adds another Money amount to this instance, protecting against arithmetic overflow. */
  public Money plus(Money other) {
    Objects.requireNonNull(other, "Số tiền cộng thêm không được null");
    return new Money(Math.addExact(this.vnd, other.vnd));
  }

  /** Formats the monetary amount according to Vietnamese representation (e.g. "1.234.000đ"). */
  public String format() {
    DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.ROOT);
    symbols.setGroupingSeparator('.');
    DecimalFormat decimalFormat = new DecimalFormat("#,##0", symbols);
    return decimalFormat.format(vnd) + "đ";
  }

  @Override
  public int compareTo(Money o) {
    return Long.compare(this.vnd, o.vnd);
  }

  @Override
  public String toString() {
    return format();
  }
}
