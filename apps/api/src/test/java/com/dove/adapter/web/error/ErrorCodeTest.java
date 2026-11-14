package com.dove.adapter.web.error;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.web.GlobalExceptionHandler;
import com.dove.domain.InvalidTicketException;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@DisplayName("T05.02 - Business Error Codes & Exceptions Specification (SRS 6.2)")
class ErrorCodeTest {

  private MockMvc mockMvc;

  @RestController
  @RequestMapping("/test/business-errors")
  static class TestBusinessErrorController {

    @GetMapping("/invalid-ticket")
    public void throwInvalidTicket() {
      throw new InvalidTicketException("Vé không phải 6 chữ số");
    }

    @GetMapping("/invalid-date")
    public void throwInvalidDate() {
      throw new InvalidDateException("Ngày ở tương lai: 2099-01-01");
    }

    @GetMapping("/station-not-found")
    public void throwStationNotFound() {
      throw new StationNotFoundException("unknown-station");
    }

    @GetMapping("/station-not-drawing")
    public void throwStationNotDrawing() {
      throw new StationNotDrawingException("tp-hcm", LocalDate.of(2026, 11, 3));
    }

    @GetMapping("/rate-limited")
    public void throwRateLimited() {
      throw new RateLimitedException();
    }
  }

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new TestBusinessErrorController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  @DisplayName("Kiểm tra đầy đủ 5 mã lỗi nghiệp vụ theo bảng SRS 6.2")
  void errorCodes_matchSrsSpecification() {
    assertThat(ErrorCode.INVALID_TICKET.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(ErrorCode.INVALID_DATE.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(ErrorCode.STATION_NOT_FOUND.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(ErrorCode.STATION_NOT_DRAWING.getHttpStatus())
        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
    assertThat(ErrorCode.RATE_LIMITED.getHttpStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
  }

  @Test
  @DisplayName("INVALID_TICKET trả về 400 Problem Details với code INVALID_TICKET")
  void invalidTicket_returns400WithCorrectCode() throws Exception {
    mockMvc
        .perform(get("/test/business-errors/invalid-ticket"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_TICKET"))
        .andExpect(jsonPath("$.detail").value("Vé không phải 6 chữ số"));
  }

  @Test
  @DisplayName("INVALID_DATE trả về 400 Problem Details với code INVALID_DATE")
  void invalidDate_returns400WithCorrectCode() throws Exception {
    mockMvc
        .perform(get("/test/business-errors/invalid-date"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_DATE"))
        .andExpect(jsonPath("$.detail").value("Ngày ở tương lai: 2099-01-01"));
  }

  @Test
  @DisplayName("STATION_NOT_FOUND trả về 404 Problem Details với code STATION_NOT_FOUND")
  void stationNotFound_returns404WithCorrectCode() throws Exception {
    mockMvc
        .perform(get("/test/business-errors/station-not-found"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"))
        .andExpect(jsonPath("$.detail").value("Không tìm thấy đài với mã: unknown-station"));
  }

  @Test
  @DisplayName("STATION_NOT_DRAWING trả về 422 Problem Details với code STATION_NOT_DRAWING")
  void stationNotDrawing_returns422WithCorrectCode() throws Exception {
    mockMvc
        .perform(get("/test/business-errors/station-not-drawing"))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(422))
        .andExpect(jsonPath("$.code").value("STATION_NOT_DRAWING"))
        .andExpect(jsonPath("$.detail").value("Đài tp-hcm không có lịch quay vào ngày 2026-11-03"));
  }

  @Test
  @DisplayName("RATE_LIMITED trả về 429 Problem Details với code RATE_LIMITED")
  void rateLimited_returns429WithCorrectCode() throws Exception {
    mockMvc
        .perform(get("/test/business-errors/rate-limited"))
        .andExpect(status().isTooManyRequests())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(429))
        .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
        .andExpect(jsonPath("$.detail").value("Quá giới hạn"));
  }
}
