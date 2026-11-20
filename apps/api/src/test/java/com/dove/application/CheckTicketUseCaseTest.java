package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.CheckOutcome;
import com.dove.domain.CheckStatus;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import com.dove.domain.TicketNumber;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T12.02 - CheckTicketUseCase Lazy Backfill Tests")
class CheckTicketUseCaseTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private static DrawResult completeDraw(String station, LocalDate date) {
    Map<PrizeTier, List<String>> numbers = new HashMap<>();
    numbers.put(PrizeTier.EIGHTH, List.of("21"));
    numbers.put(PrizeTier.SEVENTH, List.of("321"));
    numbers.put(PrizeTier.SIXTH, List.of("2345", "3456", "4567"));
    numbers.put(PrizeTier.FIFTH, List.of("1234"));
    numbers.put(
        PrizeTier.FOURTH, List.of("44444", "55555", "66666", "77777", "88888", "12345", "23456"));
    numbers.put(PrizeTier.THIRD, List.of("22222", "33333"));
    numbers.put(PrizeTier.SECOND, List.of("81057"));
    numbers.put(PrizeTier.FIRST, List.of("99999"));
    numbers.put(PrizeTier.SPECIAL, List.of("054321"));
    return new DrawResult(station, date, numbers);
  }

  @Test
  @DisplayName("check and checkBatch lazy-backfill missing past draw before evaluating tickets")
  void checkAndCheckBatch_lazyBackfillMissingPastDraw() {
    OnDemandDrawBackfillServiceTest.InMemoryDrawRepository drawRepo =
        new OnDemandDrawBackfillServiceTest.InMemoryDrawRepository();
    StationSchedulePort schedulePort = date -> List.of("ben-tre", "vung-tau", "bac-lieu");

    StationLookupPort stationRepo = "ben-tre"::equals;

    AtomicInteger upstreamCalls = new AtomicInteger(0);
    ResultSource source =
        (stationCode, date) -> {
          upstreamCalls.incrementAndGet();
          return Optional.of(completeDraw(stationCode, date));
        };

    Clock clock = Clock.fixed(Instant.parse("2026-11-18T08:00:00Z"), VN_ZONE); // 15:00 ICT Nov 18
    IngestDrawsUseCase ingestUseCase = new IngestDrawsUseCase(schedulePort, source, drawRepo);
    OnDemandDrawBackfillService backfillService =
        new OnDemandDrawBackfillService(
            ingestUseCase, schedulePort, drawRepo, clock, true, 60, Duration.ofSeconds(60));

    CheckTicketUseCase useCase =
        new CheckTicketUseCase(
            drawRepo, schedulePort, stationRepo, Optional.of(clock), Optional.of(backfillService));

    LocalDate tuesday = LocalDate.of(2026, 11, 17);
    CheckOutcome singleOutcome = useCase.check(TicketNumber.parse("054321"), "ben-tre", tuesday);

    assertThat(singleOutcome.status()).isEqualTo(CheckStatus.CHECKED);
    assertThat(singleOutcome.result().isWon()).isTrue();
    assertThat(upstreamCalls.get()).isEqualTo(3);

    // Batch check on another past Tuesday (2026-11-10) also lazy-backfills once
    LocalDate prevTuesday = LocalDate.of(2026, 11, 10);
    List<CheckOutcome> batchOutcomes =
        useCase.checkBatch(
            List.of(TicketNumber.parse("054321"), TicketNumber.parse("000000")),
            "ben-tre",
            prevTuesday);

    assertThat(batchOutcomes).hasSize(2);
    assertThat(batchOutcomes.get(0).status()).isEqualTo(CheckStatus.CHECKED);
    assertThat(batchOutcomes.get(0).result().isWon()).isTrue();
    assertThat(batchOutcomes.get(1).result().isWon()).isFalse();
    assertThat(upstreamCalls.get()).isEqualTo(6);
  }
}
