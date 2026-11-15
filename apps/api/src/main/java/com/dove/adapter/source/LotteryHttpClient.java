package com.dove.adapter.source;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Robust HTTP client for fetching lottery results from remote web pages. Enforces connect timeout
 * (5s), read timeout (10s), and a clear identifying User-Agent (NFR-12).
 */
@Component
public class LotteryHttpClient {

  public static final String DEFAULT_USER_AGENT =
      "DoVe-Bot/1.0 (+https://github.com/thien211105/DoVe)";

  private final HttpClient httpClient;
  private final String userAgent;
  private final Duration readTimeout;

  public LotteryHttpClient() {
    this(
        HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build(),
        DEFAULT_USER_AGENT,
        Duration.ofSeconds(10));
  }

  @Autowired
  public LotteryHttpClient(
      @Value("${dove.ingestion.user-agent:" + DEFAULT_USER_AGENT + "}") String userAgent,
      @Value("${dove.ingestion.connect-timeout-ms:5000}") long connectTimeoutMs,
      @Value("${dove.ingestion.read-timeout-ms:10000}") long readTimeoutMs) {
    this(
        HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(connectTimeoutMs))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build(),
        userAgent,
        Duration.ofMillis(readTimeoutMs));
  }

  public LotteryHttpClient(HttpClient httpClient, String userAgent, Duration readTimeout) {
    this.httpClient = httpClient;
    this.userAgent = (userAgent != null && !userAgent.isBlank()) ? userAgent : DEFAULT_USER_AGENT;
    this.readTimeout = readTimeout != null ? readTimeout : Duration.ofSeconds(10);
  }

  /**
   * Fetches raw HTML content from the specified URL via HTTP GET.
   *
   * @param url the destination URL
   * @return the HTML response body
   * @throws IOException if a network or timeout error occurs
   * @throws InterruptedException if the operation is interrupted
   * @throws HttpStatusException if the server returns 4xx or 5xx HTTP status
   */
  public String fetchHtml(String url) throws IOException, InterruptedException {
    HttpRequest request =
        HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(readTimeout)
            .header("User-Agent", userAgent)
            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
            .header("Accept-Language", "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7")
            .GET()
            .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

    if (response.statusCode() >= 400) {
      throw new HttpStatusException(
          "HTTP request failed with status " + response.statusCode() + " for URL: " + url,
          response.statusCode(),
          url);
    }

    return response.body();
  }

  public String getUserAgent() {
    return userAgent;
  }

  public Duration getReadTimeout() {
    return readTimeout;
  }
}
