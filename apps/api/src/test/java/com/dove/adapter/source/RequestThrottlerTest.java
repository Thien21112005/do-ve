package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("RequestThrottler Rate Limiting Test (FR-ING-05)")
class RequestThrottlerTest {

  @Test
  @DisplayName("3 consecutive calls take at least 4 seconds with real 2-second interval")
  void threeConsecutiveCallsTakeAtLeastFourSeconds() throws InterruptedException {
    RequestThrottler throttler = new RequestThrottler(Duration.ofSeconds(2));

    long start = System.currentTimeMillis();
    throttler.acquire(); // 1st: immediate
    throttler.acquire(); // 2nd: waits ~2s
    throttler.acquire(); // 3rd: waits ~2s
    long elapsed = System.currentTimeMillis() - start;

    assertThat(elapsed).isGreaterThanOrEqualTo(3900L); // allow 100ms timer resolution tolerance
  }

  @Test
  @DisplayName("Simulated clock and sleeper verifies exact delay calculations")
  void simulatedDelayVerification() throws InterruptedException {
    AtomicLong currentTime = new AtomicLong(10000L);
    List<Long> sleepDurations = new ArrayList<>();

    RequestThrottler throttler =
        new RequestThrottler(
            Duration.ofSeconds(2),
            millis -> {
              sleepDurations.add(millis);
              currentTime.addAndGet(millis);
            },
            () -> currentTime.get());

    throttler.acquire(); // at 10000, no sleep
    assertThat(sleepDurations).isEmpty();

    // Advance 500ms
    currentTime.addAndGet(500L);
    throttler.acquire(); // at 10500, needs 1500ms sleep
    assertThat(sleepDurations).containsExactly(1500L);

    // Advance 2500ms (more than 2s)
    currentTime.addAndGet(2500L);
    throttler.acquire(); // no sleep needed
    assertThat(sleepDurations).hasSize(1);
  }
}
