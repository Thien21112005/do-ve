package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.web.dto.CheckTicketRequest;
import com.dove.adapter.web.ratelimit.RateLimitInterceptor;
import com.dove.adapter.web.ratelimit.SlidingWindowRateLimiter;
import com.dove.application.CheckTicketUseCase;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.20 - MockMvc Test: Section 3.4 Worked Examples & All Business Error Codes")
class CheckEndpointsComprehensiveMockMvcTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  private CheckControllerTest.TestDrawRepository drawRepository;
  private CheckControllerTest.TestStationSchedulePort stationSchedulePort;
  private CheckControllerTest.TestStationRepository stationRepository;
  private MockMvc mockMvc;
  private ObjectMapper objectMapper;
  private Clock fixedClock;

  private DrawResult createSrsWorkedExampleDraw() {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    Map<PrizeTier, List<String>> prizeMap =
        Map.of(
            PrizeTier.SPECIAL, List.of("654321"),
            PrizeTier.FIRST, List.of("99999"),
            PrizeTier.SECOND, List.of("81057"),
            PrizeTier.THIRD, List.of("22222", "33333"),
            PrizeTier.FOURTH,
                List.of("44444", "55555", "66666", "77777", "88888", "12345", "23456"),
            PrizeTier.FIFTH, List.of("1234"),
            PrizeTier.SIXTH, List.of("2345", "3456", "4567"),
            PrizeTier.SEVENTH, List.of("321"),
            PrizeTier.EIGHTH, List.of("21"));
    return new DrawResult("tp-hcm", drawDate, prizeMap);
  }

  @BeforeEach
  void setUp() {
    drawRepository = new CheckControllerTest.TestDrawRepository();
    stationSchedulePort = new CheckControllerTest.TestStationSchedulePort();
    stationRepository = new CheckControllerTest.TestStationRepository();

    fixedClock = Clock.fixed(Instant.parse("2026-11-09T10:00:00Z"), VN_ZONE);

    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    stationRepository.addStation("tp-hcm", "TP. Hồ Chí Minh", "SOUTH");
    stationSchedulePort.setSchedule(drawDate, List.of("tp-hcm"));
    drawRepository.putDraw(createSrsWorkedExampleDraw());

    CheckTicketUseCase useCase =
        new CheckTicketUseCase(drawRepository, stationSchedulePort, stationRepository, fixedClock);
    CheckController controller = new CheckController(useCase);

    // Rate limiter configured with limit = 10 for normal tests
    SlidingWindowRateLimiter rateLimiter =
        new SlidingWindowRateLimiter(10, Duration.ofMinutes(1), fixedClock);
    RateLimitInterceptor rateLimitInterceptor = new RateLimitInterceptor(rateLimiter, 10);

    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .addInterceptors(rateLimitInterceptor)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    objectMapper = new ObjectMapper();
    objectMapper.findAndRegisterModules();
  }

  // --- SECTION 3.4 WORKED EXAMPLES ---

  @Test
  @DisplayName("SRS 3.4 Case 1: Vé 654321 trúng ĐẶC BIỆT + BẢY + TÁM = 2.000.300.000đ")
  void case1_jackpotAndLowerPrizes() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("654321", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CHECKED"))
        .andExpect(jsonPath("$.won").value(true))
        .andExpect(jsonPath("$.wins", hasSize(3)))
        .andExpect(jsonPath("$.wins[0].tier").value("SPECIAL"))
        .andExpect(jsonPath("$.wins[0].prizeAmount").value(2000000000L))
        .andExpect(jsonPath("$.wins[1].tier").value("SEVENTH"))
        .andExpect(jsonPath("$.wins[1].prizeAmount").value(200000L))
        .andExpect(jsonPath("$.wins[2].tier").value("EIGHTH"))
        .andExpect(jsonPath("$.wins[2].prizeAmount").value(100000L))
        .andExpect(jsonPath("$.totalAmount").value(2000300000L));
  }

  @Test
  @DisplayName(
      "SRS 3.4 Case 2: Vé 154321 trúng PHỤ ĐẶC BIỆT (sai số đầu) + BẢY + TÁM = 50.300.000đ")
  void case2_consolation1AndLowerPrizes() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("154321", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CHECKED"))
        .andExpect(jsonPath("$.won").value(true))
        .andExpect(jsonPath("$.wins", hasSize(3)))
        .andExpect(
            jsonPath("$.wins[?(@.tier == 'SPECIAL_CONSOLATION')].prizeAmount").value(50000000))
        .andExpect(jsonPath("$.wins[?(@.tier == 'SEVENTH')].prizeAmount").value(200000))
        .andExpect(jsonPath("$.wins[?(@.tier == 'EIGHTH')].prizeAmount").value(100000))
        .andExpect(jsonPath("$.totalAmount").value(50300000L));
  }

  @Test
  @DisplayName("SRS 3.4 Case 3: Vé 654320 trúng KHUYẾN KHÍCH (sai 1 số ở đuôi) = 6.000.000đ")
  void case3_consolation2() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("654320", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CHECKED"))
        .andExpect(jsonPath("$.won").value(true))
        .andExpect(jsonPath("$.wins", hasSize(1)))
        .andExpect(jsonPath("$.wins[0].tier").value("ENCOURAGEMENT"))
        .andExpect(jsonPath("$.wins[0].prizeAmount").value(6000000L))
        .andExpect(jsonPath("$.totalAmount").value(6000000L));
  }

  @Test
  @DisplayName("SRS 3.4 Case 4: Vé 000000 không trúng: won=false, wins=[], totalAmount=0")
  void case4_losingTicket() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("000000", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CHECKED"))
        .andExpect(jsonPath("$.won").value(false))
        .andExpect(jsonPath("$.wins", hasSize(0)))
        .andExpect(jsonPath("$.totalAmount").value(0L));
  }

  // --- ALL BUSINESS ERROR CODES ---

  @Test
  @DisplayName("Mã lỗi 400 INVALID_TICKET: số vé không phải 6 chữ số")
  void error400_invalidTicket() throws Exception {
    CheckTicketRequest request = new CheckTicketRequest("123", "tp-hcm", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_TICKET"));
  }

  @Test
  @DisplayName("Mã lỗi 400 INVALID_DATE: ngày ở tương lai")
  void error400_invalidDate() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("654321", "tp-hcm", LocalDate.of(2026, 11, 10));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_DATE"));
  }

  @Test
  @DisplayName("Mã lỗi 404 STATION_NOT_FOUND: mã đài không tồn tại")
  void error404_stationNotFound() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("654321", "unknown-station", LocalDate.of(2026, 11, 9));

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"));
  }

  @Test
  @DisplayName("Mã lỗi 422 STATION_NOT_DRAWING: đài không quay vào ngày đó (BR-07)")
  void error422_stationNotDrawing() throws Exception {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    stationSchedulePort.setSchedule(sunday, List.of("tien-giang", "kien-giang", "da-lat"));

    CheckTicketRequest request = new CheckTicketRequest("654321", "tp-hcm", sunday);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.code").value("STATION_NOT_DRAWING"));
  }

  @Test
  @DisplayName("Mã lỗi 429 RATE_LIMITED: vượt quá giới hạn request")
  void error429_rateLimited() throws Exception {
    // Reconfigure with limit = 1 for this test
    SlidingWindowRateLimiter strictLimiter =
        new SlidingWindowRateLimiter(1, Duration.ofMinutes(1), fixedClock);
    RateLimitInterceptor strictInterceptor = new RateLimitInterceptor(strictLimiter, 1);

    CheckTicketUseCase useCase =
        new CheckTicketUseCase(drawRepository, stationSchedulePort, stationRepository, fixedClock);
    MockMvc strictMvc =
        MockMvcBuilders.standaloneSetup(new CheckController(useCase))
            .addInterceptors(strictInterceptor)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    CheckTicketRequest request =
        new CheckTicketRequest("654321", "tp-hcm", LocalDate.of(2026, 11, 9));
    String json = objectMapper.writeValueAsString(request);

    // Request 1: OK
    strictMvc
        .perform(post("/api/v1/check").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());

    // Request 2: 429 RATE_LIMITED
    strictMvc
        .perform(post("/api/v1/check").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
  }

  @Test
  @DisplayName("Trạng thái 200 RESULT_NOT_AVAILABLE: chưa có kết quả (won null)")
  void status200_resultNotAvailable() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    // Use station dong-thap which is scheduled but draw is not present
    stationRepository.addStation("dong-thap", "Đồng Tháp", "SOUTH");
    stationSchedulePort.setSchedule(drawDate, List.of("tp-hcm", "dong-thap"));

    CheckTicketRequest request = new CheckTicketRequest("654321", "dong-thap", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("RESULT_NOT_AVAILABLE"))
        .andExpect(jsonPath("$.won").value(nullValue()))
        .andExpect(jsonPath("$.wins", hasSize(0)))
        .andExpect(jsonPath("$.totalAmount").value(0L));
  }
}
