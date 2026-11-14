package com.dove.adapter.web.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread-safe sliding/fixed window rate limiter partitioned by client identifier (e.g. IP address).
 */
public class SlidingWindowRateLimiter {

  private final int maxRequests;
  private final Duration windowDuration;
  private final Clock clock;
  private final ConcurrentHashMap<String, WindowCounter> clientCounters = new ConcurrentHashMap<>();

  public SlidingWindowRateLimiter(int maxRequests, Duration windowDuration, Clock clock) {
    if (maxRequests <= 0) {
      throw new IllegalArgumentException("maxRequests must be > 0");
    }
    this.maxRequests = maxRequests;
    this.windowDuration = Objects.requireNonNull(windowDuration, "windowDuration must not be null");
    this.clock = Objects.requireNonNull(clock, "clock must not be null");
  }

  public SlidingWindowRateLimiter(int maxRequests, Duration windowDuration) {
    this(maxRequests, windowDuration, Clock.systemUTC());
  }

  public boolean tryAcquire(String clientId) {
    Objects.requireNonNull(clientId, "clientId must not be null");
    Instant now = clock.instant();

    WindowCounter counter =
        clientCounters.compute(
            clientId,
            (key, existing) -> {
              if (existing == null || now.isAfter(existing.windowStart.plus(windowDuration))) {
                return new WindowCounter(now, new AtomicInteger(1));
              }
              existing.count.incrementAndGet();
              return existing;
            });

    return counter.count.get() <= maxRequests;
  }

  public void reset() {
    clientCounters.clear();
  }

  private record WindowCounter(Instant windowStart, AtomicInteger count) {}
}
