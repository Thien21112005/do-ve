package com.dove.adapter.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

/** Request DTO for checking a lottery ticket. */
public record CheckTicketRequest(
    @NotBlank(message = "Số vé không được để trống")
        @Pattern(regexp = "^[0-9\\s-]{6,}$", message = "Vé không phải 6 chữ số")
        String ticket,
    @NotBlank(message = "Mã đài không được để trống") String stationCode,
    @NotNull(message = "Ngày quay không được để trống") LocalDate drawDate) {}
