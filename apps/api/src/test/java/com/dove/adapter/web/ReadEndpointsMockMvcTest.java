package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.persistence.StationScheduleEntity;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
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

@DisplayName("T05.19 - MockMvc Comprehensive Coverage: 5 Read Endpoints")
class ReadEndpointsMockMvcTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private FakeStationRepository stationRepository;
  private FakeStationScheduleRepository stationScheduleRepository;
  private FakeDrawRepository drawRepository;
  private MockMvc mockMvc;

  static class FakeStationRepository implements StationRepository {
    private final Map<String, StationEntity> map = new HashMap<>();

    void add(String code, String name, String region) {
      map.put(code, new StationEntity(code, name, region));
    }

    @Override
    public Optional<StationEntity> findByCode(String code) {
      return Optional.ofNullable(map.get(code));
    }

    @Override
    public List<StationEntity> findByRegion(String region) {
      return map.values().stream().filter(s -> s.getRegion().equalsIgnoreCase(region)).toList();
    }

    @Override
    public List<StationEntity> findByRegionIgnoreCase(String region) {
      return findByRegion(region);
    }

    @Override
    public List<StationEntity> findAll() {
      return new ArrayList<>(map.values());
    }

    // Unused JPA boilerplate
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
    public StationEntity getOne(Long id) {
      return null;
    }

    @Override
    public StationEntity getById(Long id) {
      return null;
    }

    @Override
    public StationEntity getReferenceById(Long id) {
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
    public Optional<StationEntity> findById(Long id) {
      return Optional.empty();
    }

    @Override
    public boolean existsById(Long id) {
      return false;
    }

    @Override
    public List<StationEntity> findAllById(Iterable<Long> longs) {
      return List.of();
    }

    @Override
    public long count() {
      return map.size();
    }

    @Override
    public void deleteById(Long id) {}

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
      return findAll();
    }

    @Override
    public Page<StationEntity> findAll(Pageable pageable) {
      return Page.empty();
    }
  }

  static class FakeStationScheduleRepository implements StationScheduleRepository {
    private final Map<Integer, List<StationEntity>> schedule = new HashMap<>();

    void setSchedule(int weekday, List<StationEntity> stations) {
      schedule.put(weekday, stations);
    }

    @Override
    public List<StationEntity> findStationsDrawingOn(int weekday) {
      return schedule.getOrDefault(weekday, List.of());
    }

    @Override
    public List<StationScheduleEntity> findByStationCode(String stationCode) {
      return List.of();
    }

    // Unused JPA boilerplate
    @Override
    public void flush() {}

    @Override
    public <S extends StationScheduleEntity> S saveAndFlush(S entity) {
      return entity;
    }

    @Override
    public <S extends StationScheduleEntity> List<S> saveAllAndFlush(Iterable<S> entities) {
      return List.of();
    }

    @Override
    public void deleteAllInBatch(Iterable<StationScheduleEntity> entities) {}

    @Override
    public void deleteAllByIdInBatch(Iterable<Long> longs) {}

    @Override
    public void deleteAllInBatch() {}

    @Override
    public StationScheduleEntity getOne(Long id) {
      return null;
    }

    @Override
    public StationScheduleEntity getById(Long id) {
      return null;
    }

    @Override
    public StationScheduleEntity getReferenceById(Long id) {
      return null;
    }

    @Override
    public <S extends StationScheduleEntity> Optional<S> findOne(Example<S> example) {
      return Optional.empty();
    }

    @Override
    public <S extends StationScheduleEntity> List<S> findAll(Example<S> example) {
      return List.of();
    }

    @Override
    public <S extends StationScheduleEntity> List<S> findAll(Example<S> example, Sort sort) {
      return List.of();
    }

    @Override
    public <S extends StationScheduleEntity> Page<S> findAll(
        Example<S> example, Pageable pageable) {
      return Page.empty();
    }

    @Override
    public <S extends StationScheduleEntity> long count(Example<S> example) {
      return 0;
    }

    @Override
    public <S extends StationScheduleEntity> boolean exists(Example<S> example) {
      return false;
    }

    @Override
    public <S extends StationScheduleEntity, R> R findBy(
        Example<S> example,
        java.util.function.Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
      return null;
    }

    @Override
    public <S extends StationScheduleEntity> S save(S entity) {
      return entity;
    }

    @Override
    public <S extends StationScheduleEntity> List<S> saveAll(Iterable<S> entities) {
      return List.of();
    }

    @Override
    public Optional<StationScheduleEntity> findById(Long id) {
      return Optional.empty();
    }

    @Override
    public boolean existsById(Long id) {
      return false;
    }

    @Override
    public List<StationScheduleEntity> findAll() {
      return List.of();
    }

    @Override
    public List<StationScheduleEntity> findAllById(Iterable<Long> longs) {
      return List.of();
    }

    @Override
    public long count() {
      return 0;
    }

    @Override
    public void deleteById(Long id) {}

    @Override
    public void delete(StationScheduleEntity entity) {}

    @Override
    public void deleteAllById(Iterable<? extends Long> longs) {}

    @Override
    public void deleteAll(Iterable<? extends StationScheduleEntity> entities) {}

    @Override
    public void deleteAll() {}

    @Override
    public List<StationScheduleEntity> findAll(Sort sort) {
      return List.of();
    }

    @Override
    public Page<StationScheduleEntity> findAll(Pageable pageable) {
      return Page.empty();
    }
  }

  static class FakeDrawRepository implements DrawRepository {
    private final Map<String, DrawResult> storage = new HashMap<>();

    void put(DrawResult draw) {
      storage.put(draw.stationCode() + ":" + draw.drawDate(), draw);
    }

    @Override
    public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
      return Optional.ofNullable(storage.get(stationCode + ":" + drawDate));
    }

    @Override
    public Optional<DrawResult> findLatestByStation(String stationCode) {
      return storage.values().stream()
          .filter(d -> d.stationCode().equals(stationCode))
          .max((a, b) -> a.drawDate().compareTo(b.drawDate()));
    }

    @Override
    public Optional<DrawResult> findLatestOverall() {
      return storage.values().stream().max((a, b) -> a.drawDate().compareTo(b.drawDate()));
    }

    @Override
    public List<DrawResult> findByDrawDate(LocalDate drawDate) {
      if (drawDate == null) {
        return List.of();
      }
      return storage.values().stream()
          .filter(d -> d.drawDate().equals(drawDate))
          .sorted((a, b) -> a.stationCode().compareTo(b.stationCode()))
          .toList();
    }

    @Override
    public List<DrawResult> findLatestDayDraws() {
      return storage.values().stream()
          .map(DrawResult::drawDate)
          .max(LocalDate::compareTo)
          .map(this::findByDrawDate)
          .orElseGet(List::of);
    }

    @Override
    public DrawResult save(DrawResult drawResult, String source) {
      put(drawResult);
      return drawResult;
    }

    @Override
    public boolean saveIfAbsent(DrawResult drawResult, String source) {
      boolean absent = !storage.containsKey(drawResult.stationCode() + ":" + drawResult.drawDate());
      put(drawResult);
      return absent;
    }
  }

  @BeforeEach
  void setUp() {
    stationRepository = new FakeStationRepository();
    stationScheduleRepository = new FakeStationScheduleRepository();
    drawRepository = new FakeDrawRepository();

    stationRepository.add("tp-hcm", "TP. Hồ Chí Minh", "SOUTH");
    stationRepository.add("dong-thap", "Đồng Tháp", "SOUTH");
    stationRepository.add("ca-mau", "Cà Mau", "SOUTH");

    Clock clock = Clock.fixed(Instant.parse("2026-11-09T10:00:00Z"), VN_ZONE);

    StationController stationController = new StationController(stationRepository);
    DrawController drawController =
        new DrawController(stationScheduleRepository, drawRepository, stationRepository, clock);

    mockMvc =
        MockMvcBuilders.standaloneSetup(stationController, drawController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  @DisplayName("Endpoint 1: GET /api/v1/stations")
  void testEndpoint1_listStations() throws Exception {
    mockMvc
        .perform(get("/api/v1/stations"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$", hasSize(3)));

    mockMvc
        .perform(get("/api/v1/stations").param("region", "SOUTH"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(3)));
  }

  @Test
  @DisplayName("Endpoint 2: GET /api/v1/stations/{code}")
  void testEndpoint2_getStation() throws Exception {
    mockMvc
        .perform(get("/api/v1/stations/tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("tp-hcm"))
        .andExpect(jsonPath("$.name").value("TP. Hồ Chí Minh"));

    mockMvc
        .perform(get("/api/v1/stations/non-existent"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"));
  }

  @Test
  @DisplayName("Endpoint 3: GET /api/v1/draws/schedule")
  void testEndpoint3_getDrawSchedule() throws Exception {
    LocalDate monday = LocalDate.of(2026, 11, 9);
    stationScheduleRepository.setSchedule(
        1,
        List.of(
            new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"),
            new StationEntity("dong-thap", "Đồng Tháp", "SOUTH"),
            new StationEntity("ca-mau", "Cà Mau", "SOUTH")));

    mockMvc
        .perform(get("/api/v1/draws/schedule").param("date", "2026-11-09"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(3)))
        .andExpect(jsonPath("$[0].code").value("tp-hcm"));

    mockMvc
        .perform(get("/api/v1/draws/schedule").param("date", "bad-date"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_DATE"));
  }

  @Test
  @DisplayName("Endpoint 4: GET /api/v1/draws")
  void testEndpoint4_getDraw() throws Exception {
    LocalDate pastDate = LocalDate.of(2026, 11, 8);
    stationScheduleRepository.setSchedule(
        pastDate.getDayOfWeek().getValue(),
        List.of(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));
    drawRepository.put(
        new DrawResult("tp-hcm", pastDate, Map.of(PrizeTier.SPECIAL, List.of("654321"))));

    mockMvc
        .perform(get("/api/v1/draws").param("date", "2026-11-08").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=86400, public"))
        .andExpect(header().exists("ETag"))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.numbers.SPECIAL[0]").value("654321"));

    // Unknown station
    mockMvc
        .perform(get("/api/v1/draws").param("date", "2026-11-08").param("station", "unknown"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("STATION_NOT_FOUND"));

    // Draw not found (2026-11-01 is also Sunday, so tp-hcm is scheduled but draw is missing)
    mockMvc
        .perform(get("/api/v1/draws").param("date", "2026-11-01").param("station", "tp-hcm"))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Endpoint 5: GET /api/v1/draws/latest")
  void testEndpoint5_getLatestDraw() throws Exception {
    LocalDate date1 = LocalDate.of(2026, 11, 8);
    LocalDate date2 = LocalDate.of(2026, 11, 9);
    drawRepository.put(
        new DrawResult("dong-thap", date1, Map.of(PrizeTier.SPECIAL, List.of("111111"))));
    drawRepository.put(
        new DrawResult("tp-hcm", date2, Map.of(PrizeTier.SPECIAL, List.of("654321"))));

    // Latest overall
    mockMvc
        .perform(get("/api/v1/draws/latest"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "no-cache"))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-09"));

    // Latest by station
    mockMvc
        .perform(get("/api/v1/draws/latest").param("station", "dong-thap"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.stationCode").value("dong-thap"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-08"));
  }

  @Test
  @DisplayName("Endpoint 6: GET /api/v1/draws/latest-day")
  void testEndpoint6_getLatestDayDraws() throws Exception {
    LocalDate date1 = LocalDate.of(2026, 11, 8);
    LocalDate date2 = LocalDate.of(2026, 11, 9);
    drawRepository.put(
        new DrawResult("dong-thap", date1, Map.of(PrizeTier.SPECIAL, List.of("111111"))));
    drawRepository.put(
        new DrawResult("tp-hcm", date2, Map.of(PrizeTier.SPECIAL, List.of("654321"))));
    drawRepository.put(
        new DrawResult("ca-mau", date2, Map.of(PrizeTier.SPECIAL, List.of("222222"))));

    // Latest day should return 2 stations on 2026-11-09
    mockMvc
        .perform(get("/api/v1/draws/latest-day"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].stationCode").value("ca-mau"))
        .andExpect(jsonPath("$[0].stationName").value("Cà Mau"))
        .andExpect(jsonPath("$[1].stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$[1].stationName").value("TP. Hồ Chí Minh"));
  }

  private static DrawResult completeDraw(String station, LocalDate date) {
    Map<PrizeTier, List<String>> n = new HashMap<>();
    n.put(PrizeTier.EIGHTH, List.of("12"));
    n.put(PrizeTier.SEVENTH, List.of("123"));
    n.put(PrizeTier.SIXTH, List.of("1234", "2345", "3456"));
    n.put(PrizeTier.FIFTH, List.of("4567"));
    n.put(PrizeTier.FOURTH, List.of("10001", "10002", "10003", "10004", "10005", "10006", "10007"));
    n.put(PrizeTier.THIRD, List.of("20001", "20002"));
    n.put(PrizeTier.SECOND, List.of("30001"));
    n.put(PrizeTier.FIRST, List.of("40001"));
    n.put(PrizeTier.SPECIAL, List.of("500001"));
    return new DrawResult(station, date, n);
  }

  private void scheduleSundayThreeStations() {
    stationScheduleRepository.setSchedule(
        7,
        List.of(
            new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"),
            new StationEntity("dong-thap", "Đồng Tháp", "SOUTH"),
            new StationEntity("ca-mau", "Cà Mau", "SOUTH")));
  }

  @Test
  @DisplayName("T11.12: past latest-day with every scheduled station complete is immutable")
  void latestDayCompletePastIsImmutable() throws Exception {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    scheduleSundayThreeStations();
    drawRepository.put(completeDraw("tp-hcm", sunday));
    drawRepository.put(completeDraw("dong-thap", sunday));
    drawRepository.put(completeDraw("ca-mau", sunday));

    mockMvc
        .perform(get("/api/v1/draws/latest-day").param("date", "2026-11-08"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=31536000, public, immutable"));
  }

  @Test
  @DisplayName("T11.12: past latest-day missing a scheduled station is NOT immutable")
  void latestDayMissingStationIsShortLived() throws Exception {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    scheduleSundayThreeStations();
    drawRepository.put(completeDraw("tp-hcm", sunday));
    drawRepository.put(completeDraw("dong-thap", sunday));

    mockMvc
        .perform(get("/api/v1/draws/latest-day").param("date", "2026-11-08"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=60"));
  }

  @Test
  @DisplayName("T11.12: past latest-day with an incomplete draw is NOT immutable")
  void latestDayIncompleteDrawIsShortLived() throws Exception {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    scheduleSundayThreeStations();
    drawRepository.put(completeDraw("tp-hcm", sunday));
    drawRepository.put(completeDraw("dong-thap", sunday));
    drawRepository.put(
        new DrawResult("ca-mau", sunday, Map.of(PrizeTier.SPECIAL, List.of("999999"))));

    mockMvc
        .perform(get("/api/v1/draws/latest-day").param("date", "2026-11-08"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=60"));
  }

  @Test
  @DisplayName("T12.02: GET /api/v1/draws and /latest-day lazy-backfill missing past draws")
  void lazyBackfillPopulatesMissingPastDrawsOnRead() throws Exception {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    scheduleSundayThreeStations();

    com.dove.application.StationSchedulePort schedulePort =
        d ->
            stationScheduleRepository.findStationsDrawingOn(d.getDayOfWeek().getValue()).stream()
                .map(StationEntity::getCode)
                .toList();
    com.dove.application.ResultSource fakeSource =
        (stationCode, date) -> Optional.of(completeDraw(stationCode, date));
    com.dove.application.IngestDrawsUseCase ingestUseCase =
        new com.dove.application.IngestDrawsUseCase(schedulePort, fakeSource, drawRepository);
    Clock clock = Clock.fixed(Instant.parse("2026-11-09T08:00:00Z"), VN_ZONE); // 15:00 ICT Nov 9
    com.dove.application.OnDemandDrawBackfillService backfillService =
        new com.dove.application.OnDemandDrawBackfillService(
            ingestUseCase,
            schedulePort,
            drawRepository,
            clock,
            true,
            60,
            java.time.Duration.ofSeconds(60));

    DrawController controllerWithBackfill =
        new DrawController(
            stationScheduleRepository, drawRepository, stationRepository, clock, backfillService);
    MockMvc mvcWithBackfill =
        MockMvcBuilders.standaloneSetup(controllerWithBackfill)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    // Initially DB is empty; calling /api/v1/draws/latest-day (no date) at 15:00 Nov 9
    // auto-backfills yesterday (2026-11-08) and returns all 3 stations!
    mvcWithBackfill
        .perform(get("/api/v1/draws/latest-day"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(3)))
        .andExpect(jsonPath("$[0].drawDate").value("2026-11-08"));

    // Calling GET /api/v1/draws for another missing past Sunday (2026-11-01) auto-backfills it too!
    mvcWithBackfill
        .perform(get("/api/v1/draws").param("date", "2026-11-01").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-01"))
        .andExpect(jsonPath("$.numbers.SPECIAL[0]").value("500001"));

    // Review I4: Seed an older Sunday (2026-11-01) for dong-thap while 2026-11-08 is cleared,
    // and advance clock to Wednesday 2026-11-11 (where yesterday 2026-11-10 is Tuesday, NOT
    // Sunday):
    // GET /api/v1/draws/latest?station=dong-thap must backfill dong-thap's latest scheduled Sunday
    // (2026-11-08)!
    FakeDrawRepository sparseRepo = new FakeDrawRepository();
    sparseRepo.put(completeDraw("dong-thap", LocalDate.of(2026, 11, 1)));
    Clock wedClock = Clock.fixed(Instant.parse("2026-11-11T08:00:00Z"), VN_ZONE);
    com.dove.application.IngestDrawsUseCase wedIngest =
        new com.dove.application.IngestDrawsUseCase(schedulePort, fakeSource, sparseRepo);
    com.dove.application.OnDemandDrawBackfillService wedBackfill =
        new com.dove.application.OnDemandDrawBackfillService(
            wedIngest,
            schedulePort,
            sparseRepo,
            wedClock,
            true,
            90,
            java.time.Duration.ofSeconds(60));
    MockMvc wedMvc =
        MockMvcBuilders.standaloneSetup(
                new DrawController(
                    stationScheduleRepository,
                    sparseRepo,
                    stationRepository,
                    wedClock,
                    wedBackfill))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    wedMvc
        .perform(get("/api/v1/draws/latest").param("station", "dong-thap"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.stationCode").value("dong-thap"))
        .andExpect(jsonPath("$.drawDate").value("2026-11-08"));
  }
}
