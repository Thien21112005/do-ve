package com.dove.adapter.source;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import com.dove.adapter.persistence.DrawResultRepository;
import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.persistence.StationScheduleEntity;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.application.DrawRepository;
import com.dove.application.IngestDrawsUseCase;
import com.dove.application.IngestDrawsUseCase.IngestSummary;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("End-to-End Ingestion Integration Test with WireMock and Repository (T04.23)")
class IngestionEndToEndIntegrationTest {

  private static WireMockServer wireMockServer;

  @BeforeAll
  static void beforeAll() {
    wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
    wireMockServer.start();
  }

  @AfterAll
  static void afterAll() {
    if (wireMockServer != null) {
      wireMockServer.stop();
    }
  }

  @DynamicPropertySource
  static void registerWireMockPort(DynamicPropertyRegistry registry) {
    registry.add("dove.ingestion.xskt.base-url", () -> "http://127.0.0.1:" + wireMockServer.port());
    registry.add("dove.ingestion.rate-limit-interval-ms", () -> "0");
  }

  @Autowired private IngestDrawsUseCase ingestDrawsUseCase;
  @Autowired private DrawRepository drawRepository;
  @Autowired private StationRepository stationRepository;
  @Autowired private StationScheduleRepository stationScheduleRepository;
  @Autowired private DrawResultRepository drawResultRepository;

  @BeforeEach
  void setUp() {
    stationScheduleRepository.deleteAll();
    drawResultRepository.deleteAll();
    stationRepository.deleteAll();
    wireMockServer.resetAll();

    // Seed scheduled stations for Monday 2026-11-02 (tp-hcm, dong-thap, ca-mau)
    StationEntity tphcm =
        stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));
    StationEntity dongThap =
        stationRepository.save(new StationEntity("dong-thap", "Đồng Tháp", "SOUTH"));
    StationEntity caMau = stationRepository.save(new StationEntity("ca-mau", "Cà Mau", "SOUTH"));

    stationScheduleRepository.save(new StationScheduleEntity(tphcm, 1));
    stationScheduleRepository.save(new StationScheduleEntity(dongThap, 1));
    stationScheduleRepository.save(new StationScheduleEntity(caMau, 1));
  }

  private String loadHtml(String filename) throws Exception {
    try (InputStream is = getClass().getResourceAsStream("/html/" + filename)) {
      assertThat(is).as("HTML fixture /html/" + filename + " must exist").isNotNull();
      return new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  @Test
  @DisplayName(
      "End-to-end: Cào kết quả qua WireMock, bóc tách đủ 18 số mỗi đài và lưu cơ sở dữ liệu an toàn")
  void testEndToEndIngestionSavesFullPrizes() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-02.html");
    LocalDate drawDate = LocalDate.of(2026, 11, 2);

    wireMockServer.stubFor(
        get(urlEqualTo("/xsmn/ngay-02-11-2026"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "text/html; charset=UTF-8")
                    .withBody(html)));

    // 1. Thực thi Ingest cho ngày 2026-11-02
    IngestSummary summary = ingestDrawsUseCase.ingestForDate(drawDate);

    assertThat(summary.totalStations()).isEqualTo(3);
    assertThat(summary.newlySaved()).isEqualTo(3);
    assertThat(summary.failedOrUnavailable()).isEqualTo(0);

    // 2. Xác thực cả 3 đài đều có đầy đủ 18 số trong Database
    List<String> expectedStations = List.of("tp-hcm", "dong-thap", "ca-mau");
    for (String stationCode : expectedStations) {
      Optional<DrawResult> optResult = drawRepository.findByStationAndDate(stationCode, drawDate);
      assertThat(optResult).isPresent();

      DrawResult result = optResult.get();
      assertThat(result.stationCode()).isEqualTo(stationCode);
      assertThat(result.drawDate()).isEqualTo(drawDate);
      assertThat(result.isComplete()).isTrue();

      int totalNumbers = result.numbers().values().stream().mapToInt(List::size).sum();
      assertThat(totalNumbers).isEqualTo(18);

      // Đảm bảo có giải đặc biệt và giải 8
      assertThat(result.getNumbers(PrizeTier.SPECIAL)).hasSize(1);
      assertThat(result.getNumbers(PrizeTier.EIGHTH)).hasSize(1);
    }

    // Kiểm tra chi tiết 1 đài: TP.HCM số giải đặc biệt phải là 482915
    DrawResult tphcm = drawRepository.findByStationAndDate("tp-hcm", drawDate).orElseThrow();
    assertThat(tphcm.getSpecialNumber()).contains("482915");

    // 3. Kiểm tra tính Idempotent: gọi lại lần 2 không gọi nguồn ngoài và không phát sinh bản ghi
    // mới
    IngestSummary rerunSummary = ingestDrawsUseCase.ingestForDate(drawDate);
    assertThat(rerunSummary.newlySaved()).isEqualTo(0);
    assertThat(rerunSummary.alreadyExisted()).isEqualTo(3);

    // WireMock chỉ nhận đúng 1 request ban đầu nhờ cache/skip logic
    wireMockServer.verify(1, getRequestedFor(urlEqualTo("/xsmn/ngay-02-11-2026")));
  }
}
