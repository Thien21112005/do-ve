package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.web.dto.CheckTicketRequest;
import com.dove.application.CheckTicketUseCase;
import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.09 - POST /api/v1/check Worked Examples Specification (SRS 3.4)")
class CheckControllerTest {

  private TestDrawRepository drawRepository;
  private MockMvc mockMvc;
  private ObjectMapper objectMapper;

  static class TestDrawRepository implements DrawRepository {
    private final Map<String, DrawResult> storage = new HashMap<>();

    void putDraw(DrawResult draw) {
      storage.put(draw.stationCode() + ":" + draw.drawDate(), draw);
    }

    @Override
    public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
      return Optional.ofNullable(storage.get(stationCode + ":" + drawDate));
    }

    @Override
    public Optional<DrawResult> findLatestByStation(String stationCode) {
      return Optional.empty();
    }

    @Override
    public Optional<DrawResult> findLatestOverall() {
      return Optional.empty();
    }

    @Override
    public DrawResult save(DrawResult drawResult, String source) {
      putDraw(drawResult);
      return drawResult;
    }

    @Override
    public boolean saveIfAbsent(DrawResult drawResult, String source) {
      boolean absent = !storage.containsKey(drawResult.stationCode() + ":" + drawResult.drawDate());
      putDraw(drawResult);
      return absent;
    }
  }

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
    drawRepository = new TestDrawRepository();
    CheckTicketUseCase useCase = new CheckTicketUseCase(drawRepository);
    CheckController controller = new CheckController(useCase);
    mockMvc =
        MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    objectMapper = new ObjectMapper();
    objectMapper.findAndRegisterModules();
  }

  @Test
  @DisplayName("Vé 654321 trúng SPECIAL + SEVENTH + EIGHTH = 2.000.300.000đ")
  void checkTicket_jackpotAndLowerPrizes_success() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    drawRepository.putDraw(createSrsWorkedExampleDraw());

    CheckTicketRequest request = new CheckTicketRequest("654321", "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.ticket").value("654321"))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-09"))
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
  @DisplayName("Vé 111111 không trúng giải: won=false, wins=[], totalAmount=0")
  void checkTicket_losingTicket_success() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    drawRepository.putDraw(createSrsWorkedExampleDraw());

    CheckTicketRequest request = new CheckTicketRequest("111111", "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.ticket").value("111111"))
        .andExpect(jsonPath("$.status").value("CHECKED"))
        .andExpect(jsonPath("$.won").value(false))
        .andExpect(jsonPath("$.wins", hasSize(0)))
        .andExpect(jsonPath("$.totalAmount").value(0L));
  }
}
