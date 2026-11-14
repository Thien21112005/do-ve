package com.dove.adapter.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.web.dto.CheckTicketRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@DisplayName("T05.08 - POST /api/v1/check Request DTO & Bean Validation Specification")
class CheckControllerValidationTest {

  private MockMvc mockMvc;
  private ObjectMapper objectMapper;

  @RestController
  @RequestMapping("/test/check-validation")
  static class DummyCheckValidationController {
    @PostMapping
    public ResponseEntity<String> checkTicket(@Valid @RequestBody CheckTicketRequest request) {
      return ResponseEntity.ok("VALID");
    }
  }

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new DummyCheckValidationController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    objectMapper = new ObjectMapper();
    objectMapper.findAndRegisterModules();
  }

  @Test
  @DisplayName("Vé sai định dạng (ít hơn 6 số) trả về 400 Bad Request và code INVALID_TICKET")
  void checkTicket_shortTicket_returns400InvalidTicket() throws Exception {
    CheckTicketRequest request = new CheckTicketRequest("123", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/test/check-validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_TICKET"));
  }

  @Test
  @DisplayName("Vé chứa ký tự chữ trả về 400 Bad Request và code INVALID_TICKET")
  void checkTicket_alphanumericTicket_returns400InvalidTicket() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("abcdef", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/test/check-validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_TICKET"));
  }

  @Test
  @DisplayName("Mã đài để trống trả về 400 Bad Request")
  void checkTicket_blankStation_returns400() throws Exception {
    CheckTicketRequest request = new CheckTicketRequest("123456", "", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/test/check-validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400));
  }

  @Test
  @DisplayName("Request hợp lệ vượt qua validation thành công 200 OK")
  void checkTicket_validRequest_passesValidation() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("654321", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/test/check-validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().string("VALID"));
  }
}
