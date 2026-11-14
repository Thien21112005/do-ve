package com.dove.adapter.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** Request DTO for checking multiple tickets (up to 20) in a single batch. */
public record BatchCheckRequest(
    @NotEmpty(message = "Danh sách vé không được để trống")
        @Size(min = 1, max = 20, message = "Số lượng vé dò mỗi lần từ 1 đến 20 vé")
        List<
                @NotBlank(message = "Số vé không được để trống")
                @Pattern(regexp = "^\\d{6}$", message = "Vé phải gồm đúng 6 chữ số") String>
            tickets,
    @NotBlank(message = "stationCode không được để trống") String stationCode,
    @NotNull(message = "drawDate không được để trống") LocalDate drawDate) {}
