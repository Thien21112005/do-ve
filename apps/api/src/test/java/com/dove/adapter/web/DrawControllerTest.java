package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.application.DrawRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.05 - GET /api/v1/draws/schedule API Specification")
class DrawControllerTest {

  private StationScheduleRepository stationScheduleRepository;
  private DrawRepository drawRepository;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    stationScheduleRepository = mock(StationScheduleRepository.class);
    drawRepository = mock(DrawRepository.class);
    DrawController controller = new DrawController(stationScheduleRepository, drawRepository);
    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  @DisplayName("GET /api/v1/draws/schedule vào thứ 7 (2026-11-07) trả về 4 đài")
  void getSchedule_saturday_returns4Stations() throws Exception {
    List<StationEntity> saturdayStations =
        List.of(
            new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"),
            new StationEntity("long-an", "Long An", "SOUTH"),
            new StationEntity("hau-giang", "Hậu Giang", "SOUTH"),
            new StationEntity("binh-phuoc", "Bình Phước", "SOUTH"));

    // 2026-11-07 is Saturday -> weekday = 6
    when(stationScheduleRepository.findStationsDrawingOn(6)).thenReturn(saturdayStations);

    mockMvc
        .perform(get("/api/v1/draws/schedule").param("date", "2026-11-07"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$", hasSize(4)))
        .andExpect(jsonPath("$[0].code").value("tp-hcm"))
        .andExpect(jsonPath("$[1].code").value("long-an"))
        .andExpect(jsonPath("$[2].code").value("hau-giang"))
        .andExpect(jsonPath("$[3].code").value("binh-phuoc"));
  }

  @Test
  @DisplayName("GET /api/v1/draws/schedule với ngày sai định dạng trả về 400 và code INVALID_DATE")
  void getSchedule_invalidDateFormat_returns400InvalidDate() throws Exception {
    mockMvc
        .perform(get("/api/v1/draws/schedule").param("date", "not-a-date"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_DATE"));
  }
}
