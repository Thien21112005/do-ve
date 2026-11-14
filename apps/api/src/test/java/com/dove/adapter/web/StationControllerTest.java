package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.03 & T05.04 - Stations API Specification")
class StationControllerTest {

  private StationRepository stationRepository;
  private MockMvc mockMvc;

  private List<StationEntity> createMockSouthernStations() {
    List<StationEntity> list = new ArrayList<>();
    String[] codes = {
      "tp-hcm", "dong-thap", "ca-mau", "ben-tre", "vung-tau", "bac-lieu",
      "dong-nai", "can-tho", "soc-trang", "tay-ninh", "an-giang", "binh-thuan",
      "vinh-long", "binh-duong", "tra-vinh", "long-an", "hau-giang", "binh-phuoc",
      "tien-giang", "kien-giang", "da-lat"
    };
    for (String code : codes) {
      list.add(new StationEntity(code, code.toUpperCase(), "SOUTH"));
    }
    return list;
  }

  @BeforeEach
  void setUp() {
    stationRepository = mock(StationRepository.class);
    StationController controller = new StationController(stationRepository);
    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  @DisplayName("GET /api/v1/stations?region=SOUTH trả về 21 đài miền Nam")
  void listStations_withSouthRegion_returns21Stations() throws Exception {
    when(stationRepository.findByRegionIgnoreCase(eq("SOUTH")))
        .thenReturn(createMockSouthernStations());

    mockMvc
        .perform(get("/api/v1/stations").param("region", "SOUTH"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$", hasSize(21)))
        .andExpect(jsonPath("$[0].code").value("tp-hcm"))
        .andExpect(jsonPath("$[0].region").value("SOUTH"));
  }

  @Test
  @DisplayName("GET /api/v1/stations không truyền region trả về toàn bộ đài")
  void listStations_withoutRegion_returnsAllStations() throws Exception {
    when(stationRepository.findAll()).thenReturn(createMockSouthernStations());

    mockMvc
        .perform(get("/api/v1/stations"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$", hasSize(21)));
  }

  @Test
  @DisplayName("GET /api/v1/stations/{code} tồn tại trả về 200 OK và thông tin đài")
  void getStation_found_returnsStationDetails() throws Exception {
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));

    mockMvc
        .perform(get("/api/v1/stations/tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.code").value("tp-hcm"))
        .andExpect(jsonPath("$.name").value("TP. Hồ Chí Minh"))
        .andExpect(jsonPath("$.region").value("SOUTH"));
  }

  @Test
  @DisplayName("GET /api/v1/stations/{code} không tồn tại trả về 404 và code STATION_NOT_FOUND")
  void getStation_notFound_returns404ProblemDetails() throws Exception {
    when(stationRepository.findByCode("unknown-station")).thenReturn(Optional.empty());

    mockMvc
        .perform(get("/api/v1/stations/unknown-station"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"))
        .andExpect(jsonPath("$.detail").value("Không tìm thấy đài với mã: unknown-station"));
  }
}
