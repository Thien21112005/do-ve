package com.dove.adapter.web;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.persistence.JpaDrawRepositoryAdapter;
import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.persistence.StationScheduleEntity;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.adapter.web.dto.BatchCheckRequest;
import com.dove.adapter.web.dto.CheckTicketRequest;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("T05.21 - End-to-End API Integration Test: Real Spring Context & DB Seed")
class ApiEndToEndIntegrationTest {

  static PostgreSQLContainer<?> postgres;

  static boolean isDockerRunning() {
    try {
      return DockerClientFactory.instance().isDockerAvailable();
    } catch (Throwable t) {
      return false;
    }
  }

  @DynamicPropertySource
  static void configureProperties(DynamicPropertyRegistry registry) {
    if (isDockerRunning()) {
      postgres =
          new PostgreSQLContainer<>("postgres:16-alpine")
              .withDatabaseName("dove_e2e_test")
              .withUsername("dove")
              .withPassword("dove");
      postgres.start();
      registry.add("spring.datasource.url", postgres::getJdbcUrl);
      registry.add("spring.datasource.username", postgres::getUsername);
      registry.add("spring.datasource.password", postgres::getPassword);
      registry.add("spring.flyway.enabled", () -> "true");
      registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }
  }

  @AfterAll
  static void stopPostgres() {
    if (postgres != null) {
      postgres.stop();
    }
  }

  @Autowired private WebApplicationContext webApplicationContext;
  @Autowired private StationRepository stationRepository;
  @Autowired private StationScheduleRepository stationScheduleRepository;
  @Autowired private JpaDrawRepositoryAdapter drawRepositoryAdapter;

  private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
  private MockMvc mockMvc;
  private final LocalDate drawDate = LocalDate.of(2024, 11, 4); // Monday

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

    StationEntity hcm =
        stationRepository
            .findByCode("tp-hcm")
            .orElseGet(
                () ->
                    stationRepository.save(
                        new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH")));

    if (stationScheduleRepository.findStationsDrawingOn(1).isEmpty()) {
      stationScheduleRepository.save(new StationScheduleEntity(hcm, 1));
    }

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
    DrawResult seedDraw = new DrawResult("tp-hcm", drawDate, prizeMap);
    drawRepositoryAdapter.saveIfAbsent(seedDraw, "E2E_SEED");
  }

  @Test
  @DisplayName("E2E: Gọi POST /api/v1/check với vé trúng thật từ DB trả về 200 OK và tiền trúng")
  void checkTicket_e2e_success() throws Exception {
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
        .andExpect(jsonPath("$.drawDate").value("2024-11-04"))
        .andExpect(jsonPath("$.status").value("CHECKED"))
        .andExpect(jsonPath("$.won").value(true))
        .andExpect(jsonPath("$.wins", hasSize(3)))
        .andExpect(jsonPath("$.totalAmount").value(2000300000L));
  }

  @Test
  @DisplayName("E2E: Gọi POST /api/v1/check/batch thật từ DB trả về danh sách và tổng tiền gộp")
  void checkBatch_e2e_success() throws Exception {
    BatchCheckRequest request =
        new BatchCheckRequest(List.of("654321", "111111"), "tp-hcm", drawDate);

    mockMvc
        .perform(
            post("/api/v1/check/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.results", hasSize(2)))
        .andExpect(jsonPath("$.results[0].ticket").value("654321"))
        .andExpect(jsonPath("$.results[0].won").value(true))
        .andExpect(jsonPath("$.results[1].ticket").value("111111"))
        .andExpect(jsonPath("$.results[1].won").value(false))
        .andExpect(jsonPath("$.totalAmount").value(2000300000L));
  }

  @Test
  @DisplayName("E2E: Gọi GET /api/v1/draws thật từ DB có Cache-Control immutable")
  void getDraw_e2e_success() throws Exception {
    mockMvc
        .perform(get("/api/v1/draws").param("date", "2024-11-04").param("station", "tp-hcm"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", "max-age=31536000, public, immutable"))
        .andExpect(jsonPath("$.stationCode").value("tp-hcm"))
        .andExpect(jsonPath("$.numbers.SPECIAL[0]").value("654321"));
  }

  @Test
  @DisplayName("E2E: Gọi GET /api/v1/app/config đọc cấu hình thật từ context")
  void getAppConfig_e2e_success() throws Exception {
    mockMvc
        .perform(get("/api/v1/app/config"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.minSupportedVersion").value("1.0.0"))
        .andExpect(jsonPath("$.maintenance").value(false));
  }
}
