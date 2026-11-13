package com.dove.adapter.cli;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dove.application.IngestDrawsUseCase;
import com.dove.application.IngestDrawsUseCase.IngestSummary;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.DefaultApplicationArguments;

class BackfillRunnerTest {

  private IngestDrawsUseCase ingestUseCase;
  private Clock fixedClock;
  private BackfillRunner runner;

  @BeforeEach
  void setUp() {
    ingestUseCase = mock(IngestDrawsUseCase.class);
    fixedClock = Clock.fixed(Instant.parse("2026-11-07T12:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
    runner = new BackfillRunner(ingestUseCase, fixedClock);

    when(ingestUseCase.ingestForDate(any(LocalDate.class)))
        .thenAnswer(
            invocation -> {
              LocalDate d = invocation.getArgument(0);
              return new IngestSummary(d, 3, 3, 0, 0);
            });
  }

  @Test
  @DisplayName("Backfill 7 ngày phải gọi ingest đúng 7 ngày tuần tự từ quá khứ đến hiện tại")
  void backfill_7_days_sequential() {
    LocalDate endDate = LocalDate.of(2026, 11, 7);
    BackfillRunner.BackfillResult result = runner.runBackfill(7, endDate);

    assertThat(result.totalDays()).isEqualTo(7);
    assertThat(result.totalSaved()).isEqualTo(21);

    ArgumentCaptor<LocalDate> dateCaptor = ArgumentCaptor.forClass(LocalDate.class);
    verify(ingestUseCase, times(7)).ingestForDate(dateCaptor.capture());

    List<LocalDate> capturedDates = dateCaptor.getAllValues();
    assertThat(capturedDates)
        .containsExactly(
            LocalDate.of(2026, 11, 1),
            LocalDate.of(2026, 11, 2),
            LocalDate.of(2026, 11, 3),
            LocalDate.of(2026, 11, 4),
            LocalDate.of(2026, 11, 5),
            LocalDate.of(2026, 11, 6),
            LocalDate.of(2026, 11, 7));
  }

  @Test
  @DisplayName("Số ngày <= 0 phải ném IllegalArgumentException")
  void backfill_invalid_days() {
    assertThatThrownBy(() -> runner.runBackfill(0, LocalDate.now(fixedClock)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Days must be greater than 0");
  }

  @Test
  @DisplayName("ApplicationRunner kích hoạt khi có option --backfill và --days=3")
  void applicationRunner_triggers_when_backfill_arg_present() throws Exception {
    ApplicationArguments args = new DefaultApplicationArguments("--backfill", "--days=3");

    runner.run(args);

    verify(ingestUseCase, times(3)).ingestForDate(any(LocalDate.class));
  }

  @Test
  @DisplayName("ApplicationRunner kích hoạt khi có subcommand ingest --days=2")
  void applicationRunner_triggers_when_ingest_command() throws Exception {
    ApplicationArguments args = new DefaultApplicationArguments("ingest", "--days=2");

    runner.run(args);

    verify(ingestUseCase, times(2)).ingestForDate(any(LocalDate.class));
  }

  @Test
  @DisplayName("ApplicationRunner không chạy khi không có args liên quan đến backfill")
  void applicationRunner_skips_when_no_backfill_args() throws Exception {
    ApplicationArguments args = new DefaultApplicationArguments("--server.port=8080");

    runner.run(args);

    verify(ingestUseCase, never()).ingestForDate(any(LocalDate.class));
  }
}
