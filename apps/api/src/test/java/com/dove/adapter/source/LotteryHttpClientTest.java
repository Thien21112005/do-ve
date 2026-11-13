package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("LotteryHttpClient Timeout and Headers Test")
class LotteryHttpClientTest {

  private HttpServer server;
  private int serverPort;

  @BeforeEach
  void setUp() throws IOException {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    serverPort = server.getAddress().getPort();
    server.start();
  }

  @AfterEach
  void tearDown() {
    if (server != null) {
      server.stop(0);
    }
  }

  @Test
  @DisplayName("fetchHtml returns body and sends clear User-Agent header")
  void fetchHtmlSuccess() throws Exception {
    AtomicReference<String> receivedUserAgent = new AtomicReference<>();
    String expectedHtml = "<html><body><h1>KQXSMN</h1></body></html>";

    server.createContext(
        "/test-ok",
        exchange -> {
          receivedUserAgent.set(exchange.getRequestHeaders().getFirst("User-Agent"));
          byte[] responseBytes = expectedHtml.getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
          exchange.sendResponseHeaders(200, responseBytes.length);
          try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
          }
        });

    LotteryHttpClient client = new LotteryHttpClient();
    String html = client.fetchHtml("http://127.0.0.1:" + serverPort + "/test-ok");

    assertThat(html).isEqualTo(expectedHtml);
    assertThat(receivedUserAgent.get()).contains("DoVe-Bot/1.0").contains("contact@dove.app");
  }

  @Test
  @DisplayName("fetchHtml throws HttpStatusException on 404 Client Error")
  void fetchHtmlNotFoundThrowsClientError() {
    server.createContext(
        "/not-found",
        exchange -> {
          exchange.sendResponseHeaders(404, -1);
          exchange.close();
        });

    LotteryHttpClient client = new LotteryHttpClient();

    assertThatThrownBy(() -> client.fetchHtml("http://127.0.0.1:" + serverPort + "/not-found"))
        .isInstanceOf(HttpStatusException.class)
        .satisfies(
            ex -> {
              HttpStatusException hex = (HttpStatusException) ex;
              assertThat(hex.getStatusCode()).isEqualTo(404);
              assertThat(hex.isClientError()).isTrue();
              assertThat(hex.isServerError()).isFalse();
            });
  }

  @Test
  @DisplayName("fetchHtml throws HttpStatusException on 500 Server Error")
  void fetchHtmlServerErrorThrowsException() {
    server.createContext(
        "/server-error",
        exchange -> {
          exchange.sendResponseHeaders(500, -1);
          exchange.close();
        });

    LotteryHttpClient client = new LotteryHttpClient();

    assertThatThrownBy(() -> client.fetchHtml("http://127.0.0.1:" + serverPort + "/server-error"))
        .isInstanceOf(HttpStatusException.class)
        .satisfies(
            ex -> {
              HttpStatusException hex = (HttpStatusException) ex;
              assertThat(hex.getStatusCode()).isEqualTo(500);
              assertThat(hex.isServerError()).isTrue();
              assertThat(hex.isClientError()).isFalse();
            });
  }

  @Test
  @DisplayName("fetchHtml respects read timeout when server is unresponsive")
  void fetchHtmlReadTimeout() {
    server.createContext(
        "/hang",
        exchange -> {
          // Never responds
          try {
            Thread.sleep(2000);
          } catch (InterruptedException ignored) {
          }
        });

    // Client with tiny 100ms read timeout
    LotteryHttpClient shortTimeoutClient =
        new LotteryHttpClient(
            HttpClient.newBuilder().connectTimeout(Duration.ofMillis(200)).build(),
            LotteryHttpClient.DEFAULT_USER_AGENT,
            Duration.ofMillis(100));

    assertThatThrownBy(
            () -> shortTimeoutClient.fetchHtml("http://127.0.0.1:" + serverPort + "/hang"))
        .isInstanceOf(HttpTimeoutException.class);
  }
}
