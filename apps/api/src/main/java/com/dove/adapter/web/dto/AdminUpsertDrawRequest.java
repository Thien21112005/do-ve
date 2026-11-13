package com.dove.adapter.web.dto;

import com.dove.domain.PrizeTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** DTO for manually submitting/upserting lottery draw results via admin endpoint. */
public record AdminUpsertDrawRequest(
    @NotBlank(message = "stationCode không được để trống") String stationCode,
    @NotNull(message = "drawDate không được để trống") LocalDate drawDate,
    @NotNull(message = "prizes không được để trống") Map<PrizeTier, List<String>> prizes) {}
