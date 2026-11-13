package com.dove.adapter.source;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("XsktResultSourceAdapter Integration with WireMock (T04.12)")
class XsktResultSourceAdapterTest {

  private WireMockServer wireMockServer;
  private XsktResultSourceAdapter adapter;

  @BeforeEach
  void setUp() {
    wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
    wireMockServer.start();

    // Use fast throttler and retry for unit tests
    RequestThrottler fastThrottler = new RequestThrottler(Duration.ZERO);
    RetryExecutor fastRetry =
        new RetryExecutor(2, new Duration[] {Duration.ofMillis(10)}, Thread::sleep);
    LotteryHttpClient httpClient = new LotteryHttpClient();
    XsktHtmlParser parser = new XsktHtmlParser();

    adapter =
        new XsktResultSourceAdapter(
            httpClient,
            parser,
            fastThrottler,
            fastRetry,
            "http://127.0.0.1:" + wireMockServer.port());
  }

  @AfterEach
  void tearDown() {
    if (wireMockServer != null) {
      wireMockServer.stop();
    }
  }

  private String loadHtml(String filename) throws Exception {
    try (InputStream is = getClass().getResourceAsStream("/html/" + filename)) {
      assertThat(is).as("HTML fixture /html/" + filename + " must exist").isNotNull();
      return new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  @Test
  @DisplayName(
      "fetch retrieves DrawResult matching fixture and caches for subsequent station queries")
  void fetchSuccessfulWithCache() throws Exception {
    String html = loadHtml("xskt_xsmn_2026-11-02.html");

    wireMockServer.stubFor(
        get(urlEqualTo("/xsmn/ngay-02-11-2026"))
            .willReturn(
                aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "text/html; charset=UTF-8")
                    .withBody(html)));

    LocalDate date = LocalDate.of(2026, 11, 2);

    // 1st call for TP.HCM: should trigger HTTP GET
    Optional<DrawResult> tphcmResult = adapter.fetch("tp-hcm", date);

    assertThat(tphcmResult).isPresent();
    DrawResult tphcm = tphcmResult.get();
    assertThat(tphcm.stationCode()).isEqualTo("tp-hcm");
    assertThat(tphcm.drawDate()).isEqualTo(date);
    assertThat(tphcm.isComplete()).isTrue();
    assertThat(tphcm.getNumbers(PrizeTier.SPECIAL)).containsExactly("482915");

    // 2nd call for Đồng Tháp on the SAME date: should hit cache and NOT issue another HTTP request
    Optional<DrawResult> dtResult = adapter.fetch("dong-thap", date);

    assertThat(dtResult).isPresent();
    assertThat(dtResult.get().stationCode()).isEqualTo("dong-thap");
    assertThat(dtResult.get().getNumbers(PrizeTier.SPECIAL)).containsExactly("019283");

    // Verify WireMock was queried exactly once
    wireMockServer.verify(1, getRequestedFor(urlEqualTo("/xsmn/ngay-02-11-2026")));
  }

  @Test
  @DisplayName("fetch returns empty Optional when remote source responds with 404")
  void fetchReturnsEmptyOn404() {
    wireMockServer.stubFor(
        get(urlEqualTo("/xsmn/ngay-01-01-2099"))
            .willReturn(aResponse().withStatus(404).withBody("Not Found")));

    Optional<DrawResult> result = adapter.fetch("tp-hcm", LocalDate.of(2099, 1, 1));

    assertThat(result).isEmpty();
  }
}
