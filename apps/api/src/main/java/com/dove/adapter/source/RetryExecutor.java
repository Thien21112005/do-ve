package com.dove.adapter.source;

import java.time.Duration;
import java.util.concurrent.Callable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Handles retrying transient failures (network errors and HTTP 5xx) with exponential backoff (1s,
 * 2s, 4s). Client errors (HTTP 4xx) are NOT retried (FR-ING-04).
 */
@Component
public class RetryExecutor {

  @FunctionalInterface
  public interface Sleeper {
    void sleep(long millis) throws InterruptedException;
  }

  private final int maxAttempts;
  private final Duration[] backoffDelays;
  private final Sleeper sleeper;

  @Autowired
  public RetryExecutor() {
    this(
        3,
        new Duration[] {Duration.ofSeconds(1), Duration.ofSeconds(2), Duration.ofSeconds(4)},
        Thread::sleep);
  }

  public RetryExecutor(int maxAttempts, Duration[] backoffDelays, Sleeper sleeper) {
    this.maxAttempts = maxAttempts;
    this.backoffDelays = backoffDelays;
    this.sleeper = sleeper != null ? sleeper : Thread::sleep;
  }

  /**
   * Executes a callable action, retrying transient exceptions up to maxAttempts with backoff
   * delays.
   *
   * @param action the callable task
   * @param <T> return type
   * @return result of the successful call
   * @throws Exception if all retry attempts fail or if an unretryable exception occurs
   */
  public <T> T executeWithRetry(Callable<T> action) throws Exception {
    int attempt = 0;
    while (true) {
      attempt++;
      try {
        return action.call();
      } catch (Exception ex) {
        if (isNonRetryable(ex) || attempt >= maxAttempts) {
          throw ex;
        }

        int delayIndex = Math.min(attempt - 1, backoffDelays.length - 1);
        long delayMs = backoffDelays[delayIndex].toMillis();
        sleeper.sleep(delayMs);
      }
    }
  }

  /** Determines if an exception should not be retried (e.g. 4xx HTTP client errors). */
  public static boolean isNonRetryable(Throwable throwable) {
    if (throwable instanceof HttpStatusException hex) {
      return hex.isClientError();
    }
    return false;
  }

  public int getMaxAttempts() {
    return maxAttempts;
  }
}
