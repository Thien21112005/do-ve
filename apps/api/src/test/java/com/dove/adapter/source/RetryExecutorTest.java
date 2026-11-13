package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Retry with Backoff Specification (T04.11 / FR-ING-04)")
class RetryExecutorTest {

  @Test
  @DisplayName("Success on first attempt does not retry or sleep")
  void successFirstAttempt() throws Exception {
    List<Long> sleepDelays = new ArrayList<>();
    RetryExecutor executor =
        new RetryExecutor(
            3,
            new Duration[] {Duration.ofSeconds(1), Duration.ofSeconds(2), Duration.ofSeconds(4)},
            sleepDelays::add);

    String result = executor.executeWithRetry(() -> "HTML_OK");

    assertThat(result).isEqualTo("HTML_OK");
    assertThat(sleepDelays).isEmpty();
  }

  @Test
  @DisplayName("Transient network failures retry with 1s, 2s backoff then succeed on attempt 3")
  void retriesTransientErrorThenSucceeds() throws Exception {
    List<Long> sleepDelays = new ArrayList<>();
    RetryExecutor executor =
        new RetryExecutor(
            3,
            new Duration[] {Duration.ofSeconds(1), Duration.ofSeconds(2), Duration.ofSeconds(4)},
            sleepDelays::add);

    AtomicInteger attempts = new AtomicInteger(0);

    String result =
        executor.executeWithRetry(
            () -> {
              int count = attempts.incrementAndGet();
              if (count < 3) {
                throw new IOException("Connection reset by peer (attempt " + count + ")");
              }
              return "HTML_SUCCESS_AFTER_RETRY";
            });

    assertThat(result).isEqualTo("HTML_SUCCESS_AFTER_RETRY");
    assertThat(attempts.get()).isEqualTo(3);
    assertThat(sleepDelays).containsExactly(1000L, 2000L);
  }

  @Test
  @DisplayName("4xx Client error (e.g. 404 Not Found) does NOT retry and fails immediately")
  void doesNotRetry4xxClientError() {
    List<Long> sleepDelays = new ArrayList<>();
    RetryExecutor executor =
        new RetryExecutor(
            3,
            new Duration[] {Duration.ofSeconds(1), Duration.ofSeconds(2), Duration.ofSeconds(4)},
            sleepDelays::add);

    AtomicInteger attempts = new AtomicInteger(0);

    assertThatThrownBy(
            () ->
                executor.executeWithRetry(
                    () -> {
                      attempts.incrementAndGet();
                      throw new HttpStatusException("Page not found", 404, "http://xskt/404");
                    }))
        .isInstanceOf(HttpStatusException.class)
        .satisfies(ex -> assertThat(((HttpStatusException) ex).getStatusCode()).isEqualTo(404));

    assertThat(attempts.get()).isEqualTo(1);
    assertThat(sleepDelays).isEmpty(); // No retry delay
  }

  @Test
  @DisplayName("5xx Server error (e.g. 503) retries with backoff")
  void retries5xxServerError() throws Exception {
    List<Long> sleepDelays = new ArrayList<>();
    RetryExecutor executor =
        new RetryExecutor(
            3,
            new Duration[] {Duration.ofSeconds(1), Duration.ofSeconds(2), Duration.ofSeconds(4)},
            sleepDelays::add);

    AtomicInteger attempts = new AtomicInteger(0);

    String result =
        executor.executeWithRetry(
            () -> {
              int count = attempts.incrementAndGet();
              if (count == 1) {
                throw new HttpStatusException("Service Unavailable", 503, "http://xskt/503");
              }
              return "HTML_OK_AFTER_503";
            });

    assertThat(result).isEqualTo("HTML_OK_AFTER_503");
    assertThat(attempts.get()).isEqualTo(2);
    assertThat(sleepDelays).containsExactly(1000L);
  }

  @Test
  @DisplayName("Exceeding max attempts throws the final exception")
  void exceedingMaxAttemptsThrowsException() {
    List<Long> sleepDelays = new ArrayList<>();
    RetryExecutor executor =
        new RetryExecutor(
            3,
            new Duration[] {Duration.ofSeconds(1), Duration.ofSeconds(2), Duration.ofSeconds(4)},
            sleepDelays::add);

    AtomicInteger attempts = new AtomicInteger(0);

    assertThatThrownBy(
            () ->
                executor.executeWithRetry(
                    () -> {
                      attempts.incrementAndGet();
                      throw new IOException("Remote host unreachable");
                    }))
        .isInstanceOf(IOException.class)
        .hasMessage("Remote host unreachable");

    assertThat(attempts.get()).isEqualTo(3);
    assertThat(sleepDelays).containsExactly(1000L, 2000L);
  }
}
