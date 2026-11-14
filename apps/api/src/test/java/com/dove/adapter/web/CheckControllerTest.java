package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.web.dto.BatchCheckRequest;
import com.dove.adapter.web.dto.CheckTicketRequest;
import com.dove.application.CheckTicketUseCase;
import com.dove.application.DrawRepository;
import com.dove.application.StationSchedulePort;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.09 - T05.11 - POST /api/v1/check Specification")
class CheckControllerTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  private TestDrawRepository drawRepository;
  private TestStationSchedulePort stationSchedulePort;
  private TestStationRepository stationRepository;
  private Clock clock;
  private MockMvc mockMvc;
  private ObjectMapper objectMapper;

  static class TestStationSchedulePort implements StationSchedulePort {
    private final Map<LocalDate, List<String>> schedule = new HashMap<>();

    void setSchedule(LocalDate date, List<String> stations) {
      schedule.put(date, stations);
    }

    @Override
    public List<String> getDrawingStationCodes(LocalDate drawDate) {
      return schedule.getOrDefault(drawDate, List.of());
    }
  }

  static class TestStationRepository implements StationRepository {
    private final Map<String, StationEntity> stations = new HashMap<>();

    void addStation(String code, String name, String region) {
      stations.put(code, new StationEntity(code, name, region));
    }

    @Override
    public Optional<StationEntity> findByCode(String code) {
      return Optional.ofNullable(stations.get(code));
    }

    @Override
    public List<StationEntity> findByRegion(String region) {
      return stations.values().stream()
          .filter(s -> s.getRegion().equalsIgnoreCase(region))
          .toList();
    }

    @Override
    public List<StationEntity> findByRegionIgnoreCase(String region) {
      return findByRegion(region);
    }

    @Override
    public void flush() {}

    @Override
    public <S extends StationEntity> S saveAndFlush(S entity) {
      return entity;
    }

    @Override
    public <S extends StationEntity> List<S> saveAllAndFlush(Iterable<S> entities) {
      return List.of();
    }

    @Override
    public void deleteAllInBatch(Iterable<StationEntity> entities) {}

    @Override
    public void deleteAllByIdInBatch(Iterable<Long> longs) {}

    @Override
    public void deleteAllInBatch() {}

    @Override
    public StationEntity getOne(Long aLong) {
      return null;
    }

    @Override
    public StationEntity getById(Long aLong) {
      return null;
    }

    @Override
    public StationEntity getReferenceById(Long aLong) {
      return null;
    }

    @Override
    public <S extends StationEntity> Optional<S> findOne(Example<S> example) {
      return Optional.empty();
    }

    @Override
    public <S extends StationEntity> List<S> findAll(Example<S> example) {
      return List.of();
    }

    @Override
    public <S extends StationEntity> List<S> findAll(Example<S> example, Sort sort) {
      return List.of();
    }

    @Override
    public <S extends StationEntity> Page<S> findAll(Example<S> example, Pageable pageable) {
      return Page.empty();
    }

    @Override
    public <S extends StationEntity> long count(Example<S> example) {
      return 0;
    }

    @Override
    public <S extends StationEntity> boolean exists(Example<S> example) {
      return false;
    }

    @Override
    public <S extends StationEntity, R> R findBy(
        Example<S> example,
        java.util.function.Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
      return null;
    }

    @Override
    public <S extends StationEntity> S save(S entity) {
      return entity;
    }

    @Override
    public <S extends StationEntity> List<S> saveAll(Iterable<S> entities) {
      return List.of();
    }

    @Override
    public Optional<StationEntity> findById(Long aLong) {
      return Optional.empty();
    }

    @Override
    public boolean existsById(Long aLong) {
      return false;
    }

    @Override
    public List<StationEntity> findAll() {
      return List.copyOf(stations.values());
    }

    @Override
    public List<StationEntity> findAllById(Iterable<Long> longs) {
      return List.of();
    }

    @Override
    public long count() {
      return stations.size();
    }

    @Override
    public void deleteById(Long aLong) {}

    @Override
    public void delete(StationEntity entity) {}

    @Override
    public void deleteAllById(Iterable<? extends Long> longs) {}

    @Override
    public void deleteAll(Iterable<? extends StationEntity> entities) {}

    @Override
    public void deleteAll() {}

    @Override
    public List<StationEntity> findAll(Sort sort) {
      return List.copyOf(stations.values());
    }

    @Override
    public Page<StationEntity> findAll(Pageable pageable) {
      return Page.empty();
    }
  }

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
    stationSchedulePort = new TestStationSchedulePort();
    stationRepository = new TestStationRepository();

    stationRepository.addStation("tp-hcm", "TP. Hồ Chí Minh", "SOUTH");
    stationSchedulePort.setSchedule(
        LocalDate.of(2026, 11, 9), List.of("tp-hcm", "dong-thap", "ca-mau"));

    // Set default clock to 2026-11-09 17:00:00 VN time (UTC+7)
    clock = Clock.fixed(Instant.parse("2026-11-09T10:00:00Z"), VN_ZONE);

    CheckTicketUseCase useCase =
        new CheckTicketUseCase(drawRepository, stationSchedulePort, stationRepository, clock);
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

  @Test
  @DisplayName("Đài không quay vào ngày đã chọn trả về 422 và code STATION_NOT_DRAWING (BR-07)")
  void checkTicket_stationNotDrawingOnDate_returns422() throws Exception {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    // Sunday schedule does not include tp-hcm
    stationSchedulePort.setSchedule(sunday, List.of("tien-giang", "kien-giang", "da-lat"));

    CheckTicketRequest request = new CheckTicketRequest("654321", "tp-hcm", sunday);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(422))
        .andExpect(jsonPath("$.code").value("STATION_NOT_DRAWING"));
  }

  @Test
  @DisplayName("Mã đài không tồn tại trong hệ thống trả về 404 và code STATION_NOT_FOUND")
  void checkTicket_unknownStation_returns404() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    CheckTicketRequest request = new CheckTicketRequest("654321", "unknown-station", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"));
  }

  @Test
  @DisplayName(
      "T05.11: Ngày dò ở tương lai (drawDate > today giờ VN) trả về 400 và code INVALID_DATE")
  void checkTicket_futureDate_returns400InvalidDate() throws Exception {
    // Current VN date is 2026-11-09. Request with 2026-11-10 is future date.
    LocalDate tomorrow = LocalDate.of(2026, 11, 10);
    CheckTicketRequest request = new CheckTicketRequest("654321", "tp-hcm", tomorrow);

    mockMvc
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_DATE"));
  }

  @Test
  @DisplayName("T05.11: Kiểm tra ranh giới 00:00 giờ VN (23:59:59 hôm nay vs 00:00:01 hôm sau)")
  void checkTicket_midnightBoundaryTest() throws Exception {
    LocalDate targetDate = LocalDate.of(2026, 11, 10);
    stationSchedulePort.setSchedule(targetDate, List.of("tp-hcm"));

    // Case A: 23:59:59 ngày 2026-11-09 giờ VN (UTC là 16:59:59) -> targetDate là tương lai -> 400
    Clock clockBeforeMidnight = Clock.fixed(Instant.parse("2026-11-09T16:59:59Z"), VN_ZONE);
    CheckTicketUseCase useCaseBefore =
        new CheckTicketUseCase(
            drawRepository, stationSchedulePort, stationRepository, clockBeforeMidnight);
    MockMvc mvcBefore =
        MockMvcBuilders.standaloneSetup(new CheckController(useCaseBefore))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    CheckTicketRequest request = new CheckTicketRequest("654321", "tp-hcm", targetDate);

    mvcBefore
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_DATE"));

    // Case B: 00:00:01 ngày 2026-11-10 giờ VN (UTC là 17:00:01 ngày 09) -> targetDate là hôm nay ->
    // hợp lệ!
    Clock clockAfterMidnight = Clock.fixed(Instant.parse("2026-11-09T17:00:01Z"), VN_ZONE);
    CheckTicketUseCase useCaseAfter =
        new CheckTicketUseCase(
            drawRepository, stationSchedulePort, stationRepository, clockAfterMidnight);
    MockMvc mvcAfter =
        MockMvcBuilders.standaloneSetup(new CheckController(useCaseAfter))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    // Since draw not in repository yet, it should return 200 with RESULT_NOT_AVAILABLE, NOT 400
    // INVALID_DATE!
    mvcAfter
        .perform(
            post("/api/v1/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("RESULT_NOT_AVAILABLE"));
  }

  @Test
  @DisplayName(
      "T05.12: Chưa có kết quả kỳ quay trả 200 OK, status RESULT_NOT_AVAILABLE, won null (không trả won=false)")
  void checkTicket_drawResultNotFound_returns200ResultNotAvailable() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    // Notice: drawRepository does NOT have the draw for this station & date
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
        .andExpect(jsonPath("$.status").value("RESULT_NOT_AVAILABLE"))
        .andExpect(jsonPath("$.won").value(nullValue()))
        .andExpect(jsonPath("$.wins", hasSize(0)))
        .andExpect(jsonPath("$.totalAmount").value(0L));
  }

  @Test
  @DisplayName("T05.12: Kết quả chưa đủ 18 số trả 200 OK, status RESULT_NOT_AVAILABLE, won null")
  void checkTicket_drawResultIncomplete_returns200ResultNotAvailable() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    // Incomplete draw: only EIGHTH tier present (1 number instead of 18 numbers)
    DrawResult incompleteDraw =
        new DrawResult("tp-hcm", drawDate, Map.of(PrizeTier.EIGHTH, List.of("21")));
    drawRepository.putDraw(incompleteDraw);

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
        .andExpect(jsonPath("$.status").value("RESULT_NOT_AVAILABLE"))
        .andExpect(jsonPath("$.won").value(nullValue()))
        .andExpect(jsonPath("$.wins", hasSize(0)))
        .andExpect(jsonPath("$.totalAmount").value(0L));
  }

  @Test
  @DisplayName("T05.13: POST /check/batch với 1 vé thành công")
  void checkBatch_oneTicket_success() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    drawRepository.putDraw(createSrsWorkedExampleDraw());

    BatchCheckRequest request = new BatchCheckRequest(List.of("654321"), "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-09"))
        .andExpect(jsonPath("$.results", hasSize(1)))
        .andExpect(jsonPath("$.results[0].ticket").value("654321"))
        .andExpect(jsonPath("$.results[0].won").value(true))
        .andExpect(jsonPath("$.totalAmount").value(2000300000L));
  }

  @Test
  @DisplayName("T05.13: POST /check/batch với đúng 20 vé thành công và tính đúng tổng tiền")
  void checkBatch_twentyTickets_success() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    drawRepository.putDraw(createSrsWorkedExampleDraw());

    List<String> tickets = new java.util.ArrayList<>();
    tickets.add("654321"); // Trúng 2.000.300.000
    for (int i = 1; i < 20; i++) {
      tickets.add(String.format("%06d", i)); // 19 vé không trúng
    }

    BatchCheckRequest request = new BatchCheckRequest(tickets, "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.results", hasSize(20)))
        .andExpect(jsonPath("$.totalAmount").value(2000300000L));
  }

  @Test
  @DisplayName("T05.13: POST /check/batch với 21 vé trả về 400 Bad Request")
  void checkBatch_twentyOneTickets_returns400() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    List<String> tickets = new java.util.ArrayList<>();
    for (int i = 0; i < 21; i++) {
      tickets.add(String.format("%06d", i));
    }

    BatchCheckRequest request = new BatchCheckRequest(tickets, "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400));
  }

  @Test
  @DisplayName("T05.13: POST /check/batch với vé sai định dạng trong list trả về 400")
  void checkBatch_invalidTicketInList_returns400() throws Exception {
    LocalDate drawDate = LocalDate.of(2026, 11, 9);
    BatchCheckRequest request = new BatchCheckRequest(List.of("123"), "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400));
  }
}
