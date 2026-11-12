package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("TicketNumber Value Object")
class TicketNumberTest {

  @Test
  @DisplayName("chấp nhận số vé 6 chữ số hợp lệ và bảo toàn số 0 ở đầu")
  void shouldAcceptValidSixDigitTicketPreservingLeadingZero() {
    TicketNumber ticket = new TicketNumber("012345");
    assertThat(ticket.value()).isEqualTo("012345");
    assertThat(ticket.toString()).isEqualTo("012345");
  }

  @ParameterizedTest
  @ValueSource(strings = {"000000", "999999", "654321", "000001"})
  @DisplayName("chấp nhận các dãy 6 chữ số khác nhau")
  void shouldAcceptVariousValidSixDigitTickets(String raw) {
    TicketNumber ticket = new TicketNumber(raw);
    assertThat(ticket.value()).isEqualTo(raw);
  }

  @Test
  @DisplayName("từ chối khi giá trị null")
  void shouldRejectNull() {
    assertThatThrownBy(() -> new TicketNumber(null))
        .isInstanceOf(InvalidTicketException.class)
        .hasMessageContaining("Số vé phải là chuỗi đúng 6 chữ số");
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "", // rỗng
        "   ", // chỉ có khoảng trắng
        "12345", // 5 chữ số
        "1234567", // 7 chữ số
        "12A456", // có ký tự chữ
        "123 45", // có khoảng trắng ở giữa
        " 123456", // có khoảng trắng ở đầu
        "123456 ", // có khoảng trắng ở cuối
        "-12345", // có dấu trừ
        "12.456", // có dấu chấm
        "01234a" // kết thúc bằng chữ
      })
  @DisplayName("từ chối các chuỗi không đúng định dạng 6 chữ số")
  void shouldRejectInvalidFormats(String invalidValue) {
    assertThatThrownBy(() -> new TicketNumber(invalidValue))
        .isInstanceOf(InvalidTicketException.class);
  }

  @Test
  @DisplayName("parse chuẩn hoá chuỗi thô có dấu gạch ngang và khoảng trắng")
  void shouldNormalizeRawTicketInput() {
    TicketNumber ticket1 = TicketNumber.parse(" 123-456 ");
    assertThat(ticket1.value()).isEqualTo("123456");

    TicketNumber ticket2 = TicketNumber.parse("01-23-45");
    assertThat(ticket2.value()).isEqualTo("012345");

    TicketNumber ticket3 = TicketNumber.parse("  98 76 54  ");
    assertThat(ticket3.value()).isEqualTo("987654");
  }

  @Test
  @DisplayName("parse ném InvalidTicketException khi chuỗi thô null hoặc không đủ 6 số")
  void shouldRejectInvalidRawInputInParse() {
    assertThatThrownBy(() -> TicketNumber.parse(null)).isInstanceOf(InvalidTicketException.class);

    assertThatThrownBy(() -> TicketNumber.parse(" 12-34 "))
        .isInstanceOf(InvalidTicketException.class);

    assertThatThrownBy(() -> TicketNumber.parse("123-4567"))
        .isInstanceOf(InvalidTicketException.class);
  }
}
