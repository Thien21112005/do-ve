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

  public static final int DEFAULT_MAX_TRACKED_CLIENTS = 10_000;

  private final int maxRequests;
  private final Duration windowDuration;
  private final Clock clock;
  private final int maxTrackedClients;
  private final ConcurrentHashMap<String, WindowCounter> clientCounters = new ConcurrentHashMap<>();

  public SlidingWindowRateLimiter(
      int maxRequests, Duration windowDuration, Clock clock, int maxTrackedClients) {
    if (maxRequests <= 0) {
      throw new IllegalArgumentException("maxRequests must be > 0");
    }
    if (maxTrackedClients <= 0) {
      throw new IllegalArgumentException("maxTrackedClients must be > 0");
    }
    this.maxRequests = maxRequests;
    this.windowDuration = Objects.requireNonNull(windowDuration, "windowDuration must not be null");
    this.clock = Objects.requireNonNull(clock, "clock must not be null");
    this.maxTrackedClients = maxTrackedClients;
  }

  public SlidingWindowRateLimiter(int maxRequests, Duration windowDuration, Clock clock) {
    this(maxRequests, windowDuration, clock, DEFAULT_MAX_TRACKED_CLIENTS);
  }

  public SlidingWindowRateLimiter(int maxRequests, Duration windowDuration) {
    this(maxRequests, windowDuration, Clock.systemUTC(), DEFAULT_MAX_TRACKED_CLIENTS);
  }

  public boolean tryAcquire(String clientId) {
    Objects.requireNonNull(clientId, "clientId must not be null");
    Instant now = clock.instant();

    if (clientCounters.size() >= maxTrackedClients) {
      evictExpired(now);
    }

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

  /**
   * Dọn dẹp các entry IP đã hết hạn ngoài window hiện tại để giải phóng bộ nhớ.
   *
   * @return số lượng client entry đã bị dọn dẹp
   */
  public int evictExpired() {
    return evictExpired(clock.instant());
  }

  /**
   * Dọn dẹp các entry IP đã hết hạn so với mốc thời gian chỉ định.
   *
   * @param now thời điểm mốc kiểm tra
   * @return số lượng client entry đã bị dọn dẹp
   */
  public int evictExpired(Instant now) {
    Objects.requireNonNull(now, "now must not be null");
    int initialSize = clientCounters.size();
    clientCounters
        .entrySet()
        .removeIf(entry -> now.isAfter(entry.getValue().windowStart.plus(windowDuration)));
    return initialSize - clientCounters.size();
  }

  public int size() {
    return clientCounters.size();
  }

  public void reset() {
    clientCounters.clear();
  }

  private record WindowCounter(Instant windowStart, AtomicInteger count) {}
}
