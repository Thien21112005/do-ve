package com.dove.adapter.source;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Throttler ensuring a minimum delay between consecutive outbound HTTP requests to the same source,
 * respecting the source host rate limits (NFR-12, FR-ING-05).
 */
@Component
public class RequestThrottler {

  @FunctionalInterface
  public interface Sleeper {
    void sleep(long millis) throws InterruptedException;
  }

  @FunctionalInterface
  public interface TimeProvider {
    long currentTimeMillis();
  }

  private final Duration minInterval;
  private final Sleeper sleeper;
  private final TimeProvider timeProvider;
  private long lastRequestTimeMillis = 0;

  public RequestThrottler() {
    this(Duration.ofSeconds(2), Thread::sleep, System::currentTimeMillis);
  }

  public RequestThrottler(
      @Value("${dove.ingestion.rate-limit-interval-ms:2000}") long minIntervalMs) {
    this(Duration.ofMillis(minIntervalMs), Thread::sleep, System::currentTimeMillis);
  }

  public RequestThrottler(Duration minInterval) {
    this(minInterval, Thread::sleep, System::currentTimeMillis);
  }

  public RequestThrottler(Duration minInterval, Sleeper sleeper, TimeProvider timeProvider) {
    this.minInterval = minInterval;
    this.sleeper = sleeper;
    this.timeProvider = timeProvider;
  }

  /**
   * Blocks the current thread until the minimum interval since the last request has elapsed.
   *
   * @throws InterruptedException if interrupted while waiting
   */
  public synchronized void acquire() throws InterruptedException {
    long now = timeProvider.currentTimeMillis();
    long elapsed = now - lastRequestTimeMillis;
    long requiredDelay = minInterval.toMillis() - elapsed;

    if (requiredDelay > 0 && lastRequestTimeMillis > 0) {
      sleeper.sleep(requiredDelay);
      lastRequestTimeMillis = timeProvider.currentTimeMillis();
    } else {
      lastRequestTimeMillis = now;
    }
  }

  public Duration getMinInterval() {
    return minInterval;
  }
}
