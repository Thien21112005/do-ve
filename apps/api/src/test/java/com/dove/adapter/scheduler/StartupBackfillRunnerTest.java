package com.dove.adapter.scheduler;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.application.DrawRepository;
import com.dove.application.IngestDrawsUseCase;
import com.dove.application.OnDemandDrawBackfillService;
import com.dove.application.ResultSource;
import com.dove.application.StationSchedulePort;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T12.03 - StartupBackfillRunner Tests")
class StartupBackfillRunnerTest {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private static DrawResult completeDraw(String station, LocalDate date) {
    Map<PrizeTier, List<String>> numbers = new HashMap<>();
    numbers.put(PrizeTier.EIGHTH, List.of("12"));
    numbers.put(PrizeTier.SEVENTH, List.of("123"));
    numbers.put(PrizeTier.SIXTH, List.of("1234", "2345", "3456"));
    numbers.put(PrizeTier.FIFTH, List.of("4567"));
    numbers.put(
        PrizeTier.FOURTH, List.of("10001", "10002", "10003", "10004", "10005", "10006", "10007"));
    numbers.put(PrizeTier.THIRD, List.of("20001", "20002"));
    numbers.put(PrizeTier.SECOND, List.of("30001"));
    numbers.put(PrizeTier.FIRST, List.of("40001"));
    numbers.put(PrizeTier.SPECIAL, List.of("054321"));
    return new DrawResult(station, date, numbers);
  }

  static class SimpleDrawRepo implements DrawRepository {
    private final Map<String, DrawResult> map = new ConcurrentHashMap<>();

    @Override
    public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
      return Optional.ofNullable(map.get(stationCode + ":" + drawDate));
    }

    @Override
    public Optional<DrawResult> findLatestByStation(String stationCode) {
      return Optional.empty();
    }

    @Override
    public Optional<DrawResult> findLatestOverall() {
      return Optional.empty();
    }

    @Override
    public DrawResult save(DrawResult drawResult, String source) {
      map.put(drawResult.stationCode() + ":" + drawResult.drawDate(), drawResult);
      return drawResult;
    }

    @Override
    public boolean saveIfAbsent(DrawResult drawResult, String source) {
      return map.putIfAbsent(drawResult.stationCode() + ":" + drawResult.drawDate(), drawResult)
          == null;
    }
  }

  @Test
  @DisplayName(
      "Catch-up backfills recent N days newest-first up to yesterday before 16:40 and skips complete days")
  void runCatchUpSynchronously_newestFirstAndSkipsCompleteDays() {
    SimpleDrawRepo drawRepo = new SimpleDrawRepo();
    StationSchedulePort schedulePort = date -> List.of("ca-mau", "dong-thap", "tp-hcm");

    // Pre-seed 2026-11-16 as already complete in DB (just like user's real DB!)
    LocalDate nov16 = LocalDate.of(2026, 11, 16);
    drawRepo.save(completeDraw("ca-mau", nov16), "SEED");
    drawRepo.save(completeDraw("dong-thap", nov16), "SEED");
    drawRepo.save(completeDraw("tp-hcm", nov16), "SEED");

    List<LocalDate> fetchedDates = Collections.synchronizedList(new ArrayList<>());
    ResultSource source =
        (stationCode, date) -> {
          if (stationCode.equals("ca-mau")) {
            fetchedDates.add(date);
          }
          return Optional.of(completeDraw(stationCode, date));
        };

    // Current time: 2026-11-18 14:40 ICT (07:40Z) -> latest expected day is 2026-11-17
    Clock clock = Clock.fixed(Instant.parse("2026-11-18T07:40:00Z"), VN_ZONE);
    IngestDrawsUseCase ingestUseCase = new IngestDrawsUseCase(schedulePort, source, drawRepo);
    OnDemandDrawBackfillService backfillService =
        new OnDemandDrawBackfillService(
            ingestUseCase, schedulePort, drawRepo, clock, true, 60, Duration.ofSeconds(60));

    StartupBackfillRunner runner = new StartupBackfillRunner(backfillService, true, 4);
    int processed = runner.runCatchUpSynchronously();

    assertThat(processed).isEqualTo(4);
    // 4-day window ending 2026-11-17 is: 17/11, 16/11 (skipped!), 15/11, 14/11
    assertThat(fetchedDates)
        .containsExactly(
            LocalDate.of(2026, 11, 17), LocalDate.of(2026, 11, 15), LocalDate.of(2026, 11, 14));
  }

  @Test
  @DisplayName("Disabled runner does nothing on startup")
  void disabledRunner_doesNothing() {
    SimpleDrawRepo drawRepo = new SimpleDrawRepo();
    StationSchedulePort schedulePort = date -> List.of("tp-hcm");
    List<LocalDate> fetchedDates = new ArrayList<>();
    ResultSource source =
        (stationCode, date) -> {
          fetchedDates.add(date);
          return Optional.of(completeDraw(stationCode, date));
        };
    Clock clock = Clock.fixed(Instant.parse("2026-11-18T07:40:00Z"), VN_ZONE);
    IngestDrawsUseCase ingestUseCase = new IngestDrawsUseCase(schedulePort, source, drawRepo);
    OnDemandDrawBackfillService backfillService =
        new OnDemandDrawBackfillService(
            ingestUseCase, schedulePort, drawRepo, clock, true, 60, Duration.ofSeconds(60));

    StartupBackfillRunner runner = new StartupBackfillRunner(backfillService, false, 14);
    runner.onApplicationReady();

    assertThat(runner.runCatchUpSynchronously()).isZero();
    assertThat(fetchedDates).isEmpty();
  }
}
