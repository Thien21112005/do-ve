package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Money Value Object")
class MoneyTest {

  @Test
  @DisplayName("khởi tạo và lấy giá trị hợp lệ")
  void shouldCreateValidMoney() {
    Money money = new Money(50_000);
    assertThat(money.vnd()).isEqualTo(50_000);
  }

  @Test
  @DisplayName("từ chối số tiền âm")
  void shouldRejectNegativeAmount() {
    assertThatThrownBy(() -> new Money(-1))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Số tiền không được âm");
  }

  @Test
  @DisplayName("cộng hai số tiền chính xác")
  void shouldAddMoneyCorrectly() {
    Money m1 = Money.of(1_000_000);
    Money m2 = Money.of(234_000);
    Money sum = m1.plus(m2);

    assertThat(sum.vnd()).isEqualTo(1_234_000);
  }

  @Test
  @DisplayName("ném ngoại lệ khi cộng null")
  void shouldThrowWhenAddingNull() {
    Money m = Money.of(10_000);
    assertThatThrownBy(() -> m.plus(null)).isInstanceOf(NullPointerException.class);
  }

  @Test
  @DisplayName("định dạng chuẩn hiển thị tiếng Việt với hậu tố đ và dấu chấm phân cách hàng nghìn")
  void shouldFormatVietnameseCurrency() {
    assertThat(Money.ZERO.format()).isEqualTo("0đ");
    assertThat(Money.of(100_000).format()).isEqualTo("100.000đ");
    assertThat(Money.of(1_234_000).format()).isEqualTo("1.234.000đ");
    assertThat(Money.of(2_000_000_000L).format()).isEqualTo("2.000.000.000đ");
  }

  @Test
  @DisplayName("so sánh hai số tiền")
  void shouldCompareMoney() {
    assertThat(Money.of(100)).isLessThan(Money.of(200));
    assertThat(Money.of(200)).isEqualByComparingTo(Money.of(200));
    assertThat(Money.of(300)).isGreaterThan(Money.of(200));
  }
}
