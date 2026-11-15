package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.05 - T05.07 - Draws API Specification")
class DrawControllerTest {

  private StationScheduleRepository stationScheduleRepository;
  private DrawRepository drawRepository;
  private StationRepository stationRepository;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    stationScheduleRepository = mock(StationScheduleRepository.class);
    drawRepository = mock(DrawRepository.class);
    stationRepository = mock(StationRepository.class);
    when(stationScheduleRepository.findStationsDrawingOn(org.mockito.ArgumentMatchers.anyInt()))
        .thenReturn(List.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    DrawController controller =
        new DrawController(stationScheduleRepository, drawRepository, stationRepository);
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

  @Test
  @DisplayName("GET /api/v1/draws?date=2026-11-09&station=tp-hcm trả về 200 OK đúng JSON mục 6.2")
  void getDraw_found_returns200AndNumbers() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    Map<PrizeTier, List<String>> prizeMap =
        Map.of(
            PrizeTier.SPECIAL, List.of("654321"),
            PrizeTier.FIRST, List.of("99999"),
            PrizeTier.SECOND, List.of("11111"),
            PrizeTier.THIRD, List.of("22222", "33333"),
            PrizeTier.FOURTH,
                List.of("44444", "55555", "66666", "77777", "88888", "12345", "23456"),
            PrizeTier.FIFTH, List.of("1234"),
            PrizeTier.SIXTH, List.of("2345", "3456", "4567"),
            PrizeTier.SEVENTH, List.of("321"),
            PrizeTier.EIGHTH, List.of("21"));
    DrawResult drawResult = new DrawResult("tp-hcm", drawDate, prizeMap);

    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(drawRepository.findByStationAndDate("tp-hcm", drawDate))
        .thenReturn(Optional.of(drawResult));

    mockMvc
        .perform(get("/api/v1/draws").param("date", "2026-11-09").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.stationName").value("TP. Hồ Chí Minh"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-09"))
        .andExpect(jsonPath("$.numbers.SPECIAL[0]").value("654321"))
        .andExpect(jsonPath("$.numbers.FIRST[0]").value("99999"))
        .andExpect(jsonPath("$.numbers.SEVENTH[0]").value("321"))
        .andExpect(jsonPath("$.numbers.EIGHTH[0]").value("21"));
  }

  @Test
  @DisplayName("GET /api/v1/draws với đài không tồn tại trả về 404 và code STATION_NOT_FOUND")
  void getDraw_unknownStation_returns404StationNotFound() throws Exception {
    when(stationRepository.findByCode("unknown-station")).thenReturn(Optional.empty());

    mockMvc
        .perform(
            get("/api/v1/draws").param("date", "2026-11-09").param("station", "unknown-station"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"));
  }

  @Test
  @DisplayName("GET /api/v1/draws với kỳ chưa có kết quả trả về 404 Not Found")
  void getDraw_notAvailable_returns404NotFound() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(stationScheduleRepository.findStationsDrawingOn(1))
        .thenReturn(List.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(drawRepository.findByStationAndDate("tp-hcm", drawDate)).thenReturn(Optional.empty());

    mockMvc
        .perform(get("/api/v1/draws").param("date", "2026-11-09").param("station", "tp-hcm"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("RESULT_NOT_AVAILABLE"));
  }

  @Test
  @DisplayName(
      "GET /api/v1/draws với đài không có lịch quay vào ngày đó trả về 422 và code STATION_NOT_DRAWING (T09.63)")
  void getDraw_stationNotDrawing_returns422StationNotDrawing() throws Exception {
    LocalDate tuesday = LocalDate.of(2026, 11, 10); // Tuesday (weekday 2)
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(stationScheduleRepository.findStationsDrawingOn(2))
        .thenReturn(List.of(new StationEntity("ben-tre", "Bến Tre", "SOUTH")));

    mockMvc
        .perform(get("/api/v1/draws").param("date", "2026-11-10").param("station", "tp-hcm"))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(422))
        .andExpect(jsonPath("$.code").value("STATION_NOT_DRAWING"));
  }

  @Test
  @DisplayName(
      "GET /api/v1/draws/latest không truyền station trả về kỳ quay mới nhất toàn hệ thống")
  void getLatestDraw_overall_returnsLatestDraw() throws Exception {
    LocalDate latestDate = LocalDate.of(2026, 11, 10);
    DrawResult latestResult =
        new DrawResult("dong-nai", latestDate, Map.of(PrizeTier.SPECIAL, List.of("123456")));

    when(drawRepository.findLatestOverall()).thenReturn(Optional.of(latestResult));

    mockMvc
        .perform(get("/api/v1/draws/latest"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.stationCode").value("dong-nai"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-10"))
        .andExpect(jsonPath("$.numbers.SPECIAL[0]").value("123456"));
  }

  @Test
  @DisplayName("GET /api/v1/draws/latest?station=tp-hcm trả về kỳ quay mới nhất của đài đó")
  void getLatestDraw_byStation_returnsLatestDrawForStation() throws Exception {
    LocalDate latestDate = LocalDate.of(2026, 11, 9);
    DrawResult latestResult =
        new DrawResult("tp-hcm", latestDate, Map.of(PrizeTier.SPECIAL, List.of("654321")));

    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(drawRepository.findLatestByStation("tp-hcm")).thenReturn(Optional.of(latestResult));

    mockMvc
        .perform(get("/api/v1/draws/latest").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.stationName").value("TP. Hồ Chí Minh"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-09"));
  }

  @Test
  @DisplayName(
      "GET /api/v1/draws/latest với đài không tồn tại trả về 404 và code STATION_NOT_FOUND")
  void getLatestDraw_unknownStation_returns404() throws Exception {
    when(stationRepository.findByCode("unknown-station")).thenReturn(Optional.empty());

    mockMvc
        .perform(get("/api/v1/draws/latest").param("station", "unknown-station"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"));
  }

  @Test
  @DisplayName("GET /api/v1/draws/latest khi hệ thống chưa có dữ liệu trả về 404 Not Found")
  void getLatestDraw_emptyDb_returns404() throws Exception {
    when(drawRepository.findLatestOverall()).thenReturn(Optional.empty());

    mockMvc
        .perform(get("/api/v1/draws/latest"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("RESULT_NOT_AVAILABLE"));
  }

  @Test
  @DisplayName(
      "T09.64: Kỳ quá khứ trả về header Cache-Control: max-age=86400, public và có ETag (revalidatable)")
  void getDraw_pastDate_returnsCacheControlMaxAge1DayAndETag() throws Exception {
    LocalDate pastDate = LocalDate.of(2026, 11, 8);
    Clock clockAtNov9 =
        Clock.fixed(Instant.parse("2026-11-09T10:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
    DrawController controller =
        new DrawController(
            stationScheduleRepository, drawRepository, stationRepository, clockAtNov9);
    MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

    DrawResult result =
        new DrawResult("tp-hcm", pastDate, Map.of(PrizeTier.SPECIAL, List.of("654321")));
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(drawRepository.findByStationAndDate("tp-hcm", pastDate)).thenReturn(Optional.of(result));

    mvc.perform(get("/api/v1/draws").param("date", "2026-11-08").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=86400, public"))
        .andExpect(header().exists("ETag"));
  }

  @Test
  @DisplayName("T09.64: GET /api/v1/draws với If-None-Match khớp ETag trả về 304 Not Modified")
  void getDraw_withMatchingETag_returns304NotModified() throws Exception {
    LocalDate pastDate = LocalDate.of(2026, 11, 8);
    Clock clockAtNov9 =
        Clock.fixed(Instant.parse("2026-11-09T10:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
    DrawController controller =
        new DrawController(
            stationScheduleRepository, drawRepository, stationRepository, clockAtNov9);
    MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

    DrawResult result =
        new DrawResult("tp-hcm", pastDate, Map.of(PrizeTier.SPECIAL, List.of("654321")));
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(drawRepository.findByStationAndDate("tp-hcm", pastDate)).thenReturn(Optional.of(result));

    String etag =
        mvc.perform(get("/api/v1/draws").param("date", "2026-11-08").param("station", "tp-hcm"))
            .andExpect(status().isOk())
            .andExpect(header().exists("ETag"))
            .andReturn()
            .getResponse()
            .getHeader("ETag");

    mvc.perform(
            get("/api/v1/draws")
                .param("date", "2026-11-08")
                .param("station", "tp-hcm")
                .header("If-None-Match", etag))
        .andExpect(status().isNotModified());
  }

  @Test
  @DisplayName("T05.15: Kỳ hôm nay trả về header Cache-Control: no-cache")
  void getDraw_todayDate_returnsCacheControlNoCache() throws Exception {
    LocalDate todayDate = LocalDate.of(2026, 11, 9);
    Clock clockAtNov9 =
        Clock.fixed(Instant.parse("2026-11-09T10:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
    DrawController controller =
        new DrawController(
            stationScheduleRepository, drawRepository, stationRepository, clockAtNov9);
    MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

    DrawResult result =
        new DrawResult("tp-hcm", todayDate, Map.of(PrizeTier.SPECIAL, List.of("654321")));
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(drawRepository.findByStationAndDate("tp-hcm", todayDate)).thenReturn(Optional.of(result));

    mvc.perform(get("/api/v1/draws").param("date", "2026-11-09").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-cache"));
  }

  @Test
  @DisplayName("T05.15: Kỳ mới nhất trả về header Cache-Control: no-cache")
  void getLatestDraw_returnsCacheControlNoCache() throws Exception {
    DrawResult result =
        new DrawResult(
            "tp-hcm", LocalDate.of(2026, 11, 9), Map.of(PrizeTier.SPECIAL, List.of("654321")));
    when(drawRepository.findLatestOverall()).thenReturn(Optional.of(result));

    mockMvc
        .perform(get("/api/v1/draws/latest"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-cache"));
  }

  @Test
  @DisplayName(
      "T09.06: GET /api/v1/draws/latest-day trả danh sách kết quả các đài của ngày gần nhất")
  void getLatestDayDraws_returnsAllStationsForLatestDay() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 7);
    DrawResult tphcm =
        new DrawResult("tp-hcm", drawDate, Map.of(PrizeTier.SPECIAL, List.of("123456")));
    DrawResult longAn =
        new DrawResult("long-an", drawDate, Map.of(PrizeTier.SPECIAL, List.of("654321")));

    when(drawRepository.findLatestDayDraws()).thenReturn(List.of(tphcm, longAn));
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    when(stationRepository.findByCode("long-an"))
        .thenReturn(Optional.of(new StationEntity("long-an", "Long An", "SOUTH")));

    mockMvc
        .perform(get("/api/v1/draws/latest-day"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$[0].stationName").value("TP. Hồ Chí Minh"))
        .andExpect(jsonPath("$[1].stationCode").value("long-an"))
        .andExpect(jsonPath("$[1].stationName").value("Long An"));
  }

  @Test
  @DisplayName("T09.06: GET /api/v1/draws/latest-day với date cụ thể trả kết quả của ngày đó")
  void getLatestDayDraws_withDateParam_returnsDrawsForDate() throws Exception {
    LocalDate specificDate = LocalDate.of(2026, 11, 2);
    DrawResult tphcm =
        new DrawResult("tp-hcm", specificDate, Map.of(PrizeTier.SPECIAL, List.of("999999")));

    when(drawRepository.findByDrawDate(specificDate)).thenReturn(List.of(tphcm));
    when(stationRepository.findByCode("tp-hcm"))
        .thenReturn(Optional.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));

    mockMvc
        .perform(get("/api/v1/draws/latest-day").param("date", "2026-11-02"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$[0].stationName").value("TP. Hồ Chí Minh"));
  }

  @Test
  @DisplayName("T09.06: GET /api/v1/draws/latest-day khi chưa có kết quả trả về mảng rỗng")
  void getLatestDayDraws_whenEmpty_returnsEmptyList() throws Exception {
    when(drawRepository.findLatestDayDraws()).thenReturn(List.of());

    mockMvc
        .perform(get("/api/v1/draws/latest-day"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(0)));
  }
}
