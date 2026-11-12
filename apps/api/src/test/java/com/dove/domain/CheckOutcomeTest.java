package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("CheckOutcome Model (BR-06)")
class CheckOutcomeTest {

  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);
  private static final String TEST_STATION = "tp-hcm";
  private static final TicketNumber TICKET = new TicketNumber("123456");

  @Test
  @DisplayName("tạo trạng thái CHECKED thành công khi vé đã được dò")
  void shouldCreateCheckedOutcome() {
    CheckResult result =
        CheckResult.of(TICKET, List.of(new Win(PrizeTier.EIGHTH, "56", Money.of(100_000L))));
    CheckOutcome outcome = CheckOutcome.checked(TICKET, TEST_STATION, TEST_DATE, result);

    assertThat(outcome.isChecked()).isTrue();
    assertThat(outcome.isResultNotAvailable()).isFalse();
    assertThat(outcome.getResult()).contains(result);
    assertThat(outcome.message()).isEqualTo("Chúc mừng bạn đã trúng thưởng!");
  }

  @Test
  @DisplayName(
      "tạo trạng thái RESULT_NOT_AVAILABLE khi chưa có kết quả (không trả kết quả thua cuộc)")
  void shouldCreateResultNotAvailableOutcome() {
    CheckOutcome outcome = CheckOutcome.notAvailable(TICKET, TEST_STATION, TEST_DATE, null);

    assertThat(outcome.isChecked()).isFalse();
    assertThat(outcome.isResultNotAvailable()).isTrue();
    assertThat(outcome.getResult()).isEmpty();
    assertThat(outcome.message()).contains("Chưa có kết quả mở thưởng");
  }

  @Test
  @DisplayName("ném NullPointerException khi CHECKED nhưng result null")
  void shouldRejectNullResultWhenChecked() {
    assertThatThrownBy(() -> CheckOutcome.checked(TICKET, TEST_STATION, TEST_DATE, null))
        .isInstanceOf(NullPointerException.class)
        .hasMessageContaining("result không được null khi status là CHECKED");
  }
}
