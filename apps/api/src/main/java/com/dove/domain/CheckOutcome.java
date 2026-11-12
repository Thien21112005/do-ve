package com.dove.domain;

import java.time.LocalDate;
import java.util.Objects;
import java.util.Optional;

/**
 * Outcome of evaluating a ticket against a lottery draw.
 *
 * <p>When status is {@link CheckStatus#CHECKED}, {@code result} is present. When status is {@link
 * CheckStatus#RESULT_NOT_AVAILABLE}, {@code result} is null, ensuring incomplete draws never
 * falsely report "LOST" (BR-06).
 */
public record CheckOutcome(
    TicketNumber ticket,
    String stationCode,
    LocalDate drawDate,
    CheckStatus status,
    CheckResult result,
    String message) {

  public CheckOutcome {
    Objects.requireNonNull(ticket, "ticket không được null");
    Objects.requireNonNull(stationCode, "stationCode không được null");
    Objects.requireNonNull(drawDate, "drawDate không được null");
    Objects.requireNonNull(status, "status không được null");
  }

  public static CheckOutcome checked(
      TicketNumber ticket, String stationCode, LocalDate drawDate, CheckResult result) {
    Objects.requireNonNull(result, "result không được null khi status là CHECKED");
    String msg =
        result.isWon() ? "Chúc mừng bạn đã trúng thưởng!" : "Rất tiếc, vé không trúng giải.";
    return new CheckOutcome(ticket, stationCode, drawDate, CheckStatus.CHECKED, result, msg);
  }

  public static CheckOutcome notAvailable(
      TicketNumber ticket, String stationCode, LocalDate drawDate, String message) {
    String msg =
        (message == null || message.isBlank())
            ? "Chưa có kết quả mở thưởng cho đài và ngày đã chọn. Vui lòng quay lại sau giờ quay (16h30)."
            : message;
    return new CheckOutcome(
        ticket, stationCode, drawDate, CheckStatus.RESULT_NOT_AVAILABLE, null, msg);
  }

  public boolean isChecked() {
    return status == CheckStatus.CHECKED;
  }

  public boolean isResultNotAvailable() {
    return status == CheckStatus.RESULT_NOT_AVAILABLE;
  }

  public Optional<CheckResult> getResult() {
    return Optional.ofNullable(result);
  }
}
