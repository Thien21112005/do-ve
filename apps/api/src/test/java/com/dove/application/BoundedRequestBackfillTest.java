package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T13.04 - On-demand backfill never blocks a request thread past its budget")
class BoundedRequestBackfillTest {

  private static final LocalDate YESTERDAY = LocalDate.of(2026, 11, 17);
  // 2026-11-18 14:40 ICT
  private static final Clock CLOCK =
      Clock.fixed(Instant.parse("2026-11-18T07:40:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
  private static final StationSchedulePort SCHEDULE = date -> List.of("ben-tre");

  private static DrawResult completeDraw(String station, LocalDate date) {
    Map<PrizeTier, List<String>> n = new HashMap<>();
    n.put(PrizeTier.EIGHTH, List.of("12"));
    n.put(PrizeTier.SEVENTH, List.of("123"));
    n.put(PrizeTier.SIXTH, List.of("1234", "2345", "3456"));
    n.put(PrizeTier.FIFTH, List.of("4567"));
    n.put(PrizeTier.FOURTH, List.of("10001", "10002", "10003", "10004", "10005", "10006", "10007"));
    n.put(PrizeTier.THIRD, List.of("20001", "20002"));
    n.put(PrizeTier.SECOND, List.of("30001"));
    n.put(PrizeTier.FIRST, List.of("40001"));
    n.put(PrizeTier.SPECIAL, List.of("054321"));
    return new DrawResult(station, date, n);
  }

  private static OnDemandDrawBackfillService service(
      ResultSource source, DrawRepository repo, Duration requestWait) {
    return new OnDemandDrawBackfillService(
        new IngestDrawsUseCase(SCHEDULE, source, repo),
        SCHEDULE,
        repo,
        CLOCK,
        true,
        90,
        Duration.ofSeconds(60),
        requestWait);
  }

  @Test
  @DisplayName("Slow upstream: request returns within budget, ingest finishes in background")
  void slowUpstream_requestReturnsWithinBudget() throws Exception {
    OnDemandDrawBackfillServiceTest.InMemoryDrawRepository repo =
        new OnDemandDrawBackfillServiceTest.InMemoryDrawRepository();
    CountDownLatch release = new CountDownLatch(1);
    CountDownLatch saved = new CountDownLatch(1);
    ResultSource slow =
        (station, date) -> {
          try {
            release.await(10, TimeUnit.SECONDS);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          }
          return Optional.of(completeDraw(station, date));
        };
    DrawRepository signalling =
        new OnDemandDrawBackfillServiceTest.InMemoryDrawRepository() {
          @Override
          public Optional<DrawResult> findByStationAndDate(String s, LocalDate d) {
            return repo.findByStationAndDate(s, d);
          }

          @Override
          public boolean saveIfAbsent(DrawResult draw, String source) {
            boolean ok = repo.saveIfAbsent(draw, source);
            saved.countDown();
            return ok;
          }
        };
    OnDemandDrawBackfillService svc = service(slow, signalling, Duration.ofMillis(300));

    long start = System.nanoTime();
    svc.ensureDateIngestedForRequest(YESTERDAY);
    long elapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

    assertThat(elapsedMs).isLessThan(2_000);
    assertThat(repo.findByStationAndDate("ben-tre", YESTERDAY)).isEmpty();

    release.countDown();
    assertThat(saved.await(5, TimeUnit.SECONDS)).isTrue();
    assertThat(repo.findByStationAndDate("ben-tre", YESTERDAY)).isPresent();
  }

  @Test
  @DisplayName("Fast upstream: request sees the backfilled draw in the same call")
  void fastUpstream_resultVisibleInSameCall() {
    OnDemandDrawBackfillServiceTest.InMemoryDrawRepository repo =
        new OnDemandDrawBackfillServiceTest.InMemoryDrawRepository();
    OnDemandDrawBackfillService svc =
        service((s, d) -> Optional.of(completeDraw(s, d)), repo, Duration.ofSeconds(5));

    svc.ensureDateIngestedForRequest(YESTERDAY);

    assertThat(repo.findByStationAndDate("ben-tre", YESTERDAY)).isPresent();
  }

  @Test
  @DisplayName("Concurrent slow requests share one upstream ingest and all return within budget")
  void concurrentRequests_singleFlightAndBounded() throws Exception {
    OnDemandDrawBackfillServiceTest.InMemoryDrawRepository repo =
        new OnDemandDrawBackfillServiceTest.InMemoryDrawRepository();
    AtomicInteger fetches = new AtomicInteger();
    CountDownLatch release = new CountDownLatch(1);
    ResultSource slow =
        (s, d) -> {
          fetches.incrementAndGet();
          try {
            release.await(10, TimeUnit.SECONDS);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          }
          return Optional.of(completeDraw(s, d));
        };
    OnDemandDrawBackfillService svc = service(slow, repo, Duration.ofMillis(300));

    Thread[] threads = new Thread[4];
    long start = System.nanoTime();
    for (int i = 0; i < threads.length; i++) {
      threads[i] = new Thread(() -> svc.ensureDateIngestedForRequest(YESTERDAY));
      threads[i].start();
    }
    for (Thread t : threads) {
      t.join(5_000);
    }
    long elapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
    release.countDown();

    assertThat(elapsedMs).isLessThan(2_000);
    assertThat(fetches.get()).isEqualTo(1);
  }
}
