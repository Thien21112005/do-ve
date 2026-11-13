package com.dove.adapter.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("AdminDrawController API Specification (T04.20 & T04.21)")
class AdminDrawControllerTest {

  private static final String API_KEY = "test-secret-key-12345";
  private DrawRepository drawRepository;
  private MockMvc mockMvc;
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    drawRepository = mock(DrawRepository.class);
    AdminDrawController controller = new AdminDrawController(drawRepository, API_KEY);
    mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    objectMapper = new ObjectMapper();
    objectMapper.findAndRegisterModules();
  }

  private Map<String, Object> createValidPayload() {
    return Map.of(
        "stationCode", "tp-hcm",
        "drawDate", "2026-11-02",
        "prizes",
            Map.of(
                "SPECIAL", List.of("482915"),
                "FIRST", List.of("73924"),
                "SECOND", List.of("81057"),
                "THIRD", List.of("62481", "90135"),
                "FOURTH", List.of("17523", "49182", "30819", "65471", "82934", "10283", "74659"),
                "FIFTH", List.of("5928"),
                "SIXTH", List.of("8192", "3048", "6721"),
                "SEVENTH", List.of("395"),
                "EIGHTH", List.of("15")));
  }

  @Test
  @DisplayName("1. Thiếu header X-API-Key phải trả về 401 Unauthorized")
  void upsertDraw_missingApiKey_returns401() throws Exception {
    mockMvc
        .perform(
            put("/api/v1/admin/draws")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createValidPayload())))
        .andExpect(status().isUnauthorized());

    verify(drawRepository, never()).save(any(), any());
  }

  @Test
  @DisplayName("2. Sai header X-API-Key phải trả về 401 Unauthorized")
  void upsertDraw_invalidApiKey_returns401() throws Exception {
    mockMvc
        .perform(
            put("/api/v1/admin/draws")
                .header("X-API-Key", "wrong-secret-key")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createValidPayload())))
        .andExpect(status().isUnauthorized());

    verify(drawRepository, never()).save(any(), any());
  }

  @Test
  @DisplayName("3. Dữ liệu sai cấu trúc hoặc thiếu giải phải trả về 400 Bad Request")
  void upsertDraw_invalidStructureOrMissingPrizes_returns400() throws Exception {
    // Missing SPECIAL and FIRST prizes
    Map<String, Object> invalidPayload =
        Map.of(
            "stationCode", "tp-hcm",
            "drawDate", "2026-11-02",
            "prizes", Map.of("EIGHTH", List.of("15")));

    mockMvc
        .perform(
            put("/api/v1/admin/draws")
                .header("X-API-Key", API_KEY)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidPayload)))
        .andExpect(status().isBadRequest());

    verify(drawRepository, never()).save(any(), any());
  }

  @Test
  @DisplayName("4. API Key hợp lệ và dữ liệu đúng 18 số phải ghi đè thành công và trả về 200 OK")
  void upsertDraw_validKeyAndData_savesSuccessfullyAndReturns200() throws Exception {
    when(drawRepository.save(any(DrawResult.class), eq("ADMIN_MANUAL")))
        .thenAnswer(invocation -> invocation.getArgument(0));

    mockMvc
        .perform(
            put("/api/v1/admin/draws")
                .header("X-API-Key", API_KEY)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createValidPayload())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("success"))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-02"))
        .andExpect(jsonPath("$.totalNumbers").value(18));

    verify(drawRepository).save(any(DrawResult.class), eq("ADMIN_MANUAL"));
  }
}
