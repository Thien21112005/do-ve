package com.dove.adapter.web.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SlidingWindowRateLimiter Eviction & Memory Management (T09.60)")
class SlidingWindowRateLimiterTest {

  private AtomicReference<Instant> currentInstant;
  private Clock testClock;

  @BeforeEach
  void setUp() {
    currentInstant = new AtomicReference<>(Instant.parse("2026-11-15T12:00:00Z"));
    testClock =
        new Clock() {
          @Override
          public ZoneOffset getZone() {
            return ZoneOffset.UTC;
          }

          @Override
          public Clock withZone(java.time.ZoneId zone) {
            return this;
          }

          @Override
          public Instant instant() {
            return currentInstant.get();
          }
        };
  }

  @Test
  @DisplayName("evictExpired loại bỏ các client đã quá hạn window và giữ lại client còn hạn")
  void evictExpired_removesOnlyExpiredEntries() {
    SlidingWindowRateLimiter limiter =
        new SlidingWindowRateLimiter(5, Duration.ofMinutes(1), testClock);

    limiter.tryAcquire("10.0.0.1");
    limiter.tryAcquire("10.0.0.2");
    assertThat(limiter.size()).isEqualTo(2);

    // Thời gian tiến thêm 30s: client 1 và 2 vẫn trong hạn
    currentInstant.set(currentInstant.get().plusSeconds(30));
    limiter.tryAcquire("10.0.0.3"); // client 3 bắt đầu từ giây thứ 30
    assertThat(limiter.size()).isEqualTo(3);

    // Thời gian tiến thêm 31s (tổng cộng 61s tính từ đầu) -> client 1 và 2 đã hết hạn (60s), client
    // 3 còn hạn
    currentInstant.set(currentInstant.get().plusSeconds(31));

    int evicted = limiter.evictExpired();
    assertThat(evicted).isEqualTo(2);
    assertThat(limiter.size()).isEqualTo(1);

    // Tiến thêm 35s -> client 3 cũng hết hạn
    currentInstant.set(currentInstant.get().plusSeconds(35));
    int secondEvicted = limiter.evictExpired();
    assertThat(secondEvicted).isEqualTo(1);
    assertThat(limiter.size()).isZero();
  }

  @Test
  @DisplayName("Tự động dọn dẹp khi số lượng client vượt ngưỡng tối đa (maxTrackedClients)")
  void autoEvictsWhenExceedingMaxTrackedClients() {
    // Ngưỡng tối đa 3 clients
    SlidingWindowRateLimiter limiter =
        new SlidingWindowRateLimiter(5, Duration.ofMinutes(1), testClock, 3);

    limiter.tryAcquire("client-1");
    limiter.tryAcquire("client-2");

    // Cho 2 client đầu hết hạn
    currentInstant.set(currentInstant.get().plusSeconds(61));

    limiter.tryAcquire("client-3");
    limiter.tryAcquire("client-4"); // Vượt quá maxTrackedClients -> kích hoạt dọn dẹp cơ hội

    assertThat(limiter.size()).isLessThanOrEqualTo(3);
  }
}
