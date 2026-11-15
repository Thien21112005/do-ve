package com.dove.adapter.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

/** Request DTO for checking a lottery ticket. */
public record CheckTicketRequest(
    @NotBlank(message = "Số vé không được để trống")
        @Pattern(regexp = "^(?:[\\s-]*\\d){6}[\\s-]*$", message = "Vé phải gồm đúng 6 chữ số")
        String ticket,
    @NotBlank(message = "Mã đài không được để trống") String stationCode,
    @NotNull(message = "Ngày quay không được để trống") LocalDate drawDate) {

  @Override
  public String toString() {
    return "CheckTicketRequest[ticket=******, stationCode="
        + stationCode
        + ", drawDate="
        + drawDate
        + "]";
  }
}
