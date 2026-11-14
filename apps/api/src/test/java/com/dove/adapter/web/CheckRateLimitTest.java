package com.dove.adapter.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.16 - Rate limit for /api/v1/check Specification")
class CheckRateLimitTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  private MockMvc mockMvc;
  private ObjectMapper objectMapper;
  private AtomicReference<Instant> currentInstant;

  static class MutableClock extends Clock {
    private final AtomicReference<Instant> instantRef;
    private final ZoneId zone;

    MutableClock(AtomicReference<Instant> instantRef, ZoneId zone) {
      this.instantRef = instantRef;
      this.zone = zone;
    }

    @Override
    public ZoneId getZone() {
      return zone;
    }

    @Override
    public Clock withZone(ZoneId zone) {
      return new MutableClock(instantRef, zone);
    }

    @Override
    public Instant instant() {
      return instantRef.get();
    }
  }

  @BeforeEach
  void setUp() {
    currentInstant = new AtomicReference<>(Instant.parse("2026-11-09T10:00:00Z"));
    MutableClock mutableClock = new MutableClock(currentInstant, VN_ZONE);

    // Limit to 2 requests per minute for testing
    SlidingWindowRateLimiter limiter =
        new SlidingWindowRateLimiter(2, Duration.ofMinutes(1), mutableClock);
    RateLimitInterceptor interceptor = new RateLimitInterceptor(limiter, 2);

    CheckControllerTest.TestDrawRepository drawRepository =
        new CheckControllerTest.TestDrawRepository();
    CheckControllerTest.TestStationSchedulePort stationSchedulePort =
        new CheckControllerTest.TestStationSchedulePort();
    CheckControllerTest.TestStationRepository stationRepository =
        new CheckControllerTest.TestStationRepository();

    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    stationRepository.addStation("tp-hcm", "TP. Hồ Chí Minh", "SOUTH");
    stationSchedulePort.setSchedule(drawDate, List.of("tp-hcm"));
    drawRepository.putDraw(
        new DrawResult("tp-hcm", drawDate, Map.of(PrizeTier.SPECIAL, List.of("654321"))));

    CheckTicketUseCase useCase =
        new CheckTicketUseCase(
            drawRepository, stationSchedulePort, stationRepository, mutableClock);
    CheckController controller = new CheckController(useCase);

    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .addInterceptors(interceptor)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    objectMapper = new ObjectMapper();
    objectMapper.findAndRegisterModules();
  }

  @Test
  @DisplayName("Vượt quá giới hạn request cùng IP trả về 429 và code RATE_LIMITED")
  void checkTicket_rateLimitExceeded_returns429() throws Exception {
    CheckTicketRequest request =
        new CheckTicketRequest("654321", "tp-hcm", LocalDate.of(2026, 11, 9));
    String json = objectMapper.writeValueAsString(request);

    // Request 1: OK
    mockMvc
        .perform(post("/api/v1/check").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());

    // Request 2: OK
    mockMvc
        .perform(post("/api/v1/check").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());

    // Request 3 from same IP: 429 RATE_LIMITED
    mockMvc
        .perform(post("/api/v1/check").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isTooManyRequests())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(429))
        .andExpect(jsonPath("$.code").value("RATE_LIMITED"));

    // Request from different IP (via X-Forwarded-For): OK
    mockMvc
        .perform(
            post("/api/v1/check")
                .header("X-Forwarded-For", "10.0.0.99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
        .andExpect(status().isOk());

    // Advance clock past the 1-minute window
    currentInstant.set(currentInstant.get().plus(Duration.ofSeconds(61)));

    // Original IP is now allowed again
    mockMvc
        .perform(post("/api/v1/check").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());
  }
}
