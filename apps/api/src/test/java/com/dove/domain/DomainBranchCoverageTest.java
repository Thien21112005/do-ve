package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Domain Branch Coverage Booster")
class DomainBranchCoverageTest {

  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);
  private static final TicketNumber TICKET = new TicketNumber("654321");

  @Test
  @DisplayName("phủ các nhánh biên trong CheckResult")
  void shouldCoverCheckResultBranches() {
    // wins null, totalAmount null
    CheckResult r1 = new CheckResult(TICKET, null, null);
    assertThat(r1.wins()).isEmpty();
    assertThat(r1.totalAmount()).isEqualTo(Money.ZERO);
    assertThat(r1.winCount()).isZero();

    // of() với wins null
    CheckResult r2 = CheckResult.of(TICKET, null);
    assertThat(r2.wins()).isEmpty();
    assertThat(r2.totalAmount()).isEqualTo(Money.ZERO);
  }

  @Test
  @DisplayName("phủ các nhánh biên trong DrawResult")
  void shouldCoverDrawResultBranches() {
    // numbers map null
    DrawResult d1 = new DrawResult("tp-hcm", TEST_DATE, null);
    assertThat(d1.numbers()).isEmpty();

    // numbers chứa null key hoặc null value
    Map<PrizeTier, List<String>> mapWithNulls = new HashMap<>();
    mapWithNulls.put(null, List.of("123456"));
    mapWithNulls.put(PrizeTier.SPECIAL, null);
    DrawResult d2 = new DrawResult("tp-hcm", TEST_DATE, mapWithNulls);
    assertThat(d2.numbers()).isEmpty();

    // validate với số null trong tier
    Map<PrizeTier, List<String>> mapWithNullNum = new HashMap<>();
    mapWithNullNum.put(PrizeTier.SPECIAL, java.util.Collections.singletonList(null));
    DrawResult d3 = new DrawResult("tp-hcm", TEST_DATE, mapWithNullNum);
    assertThatThrownBy(d3::validate).isInstanceOf(InvalidDrawResultException.class);
  }

  @Test
  @DisplayName("phủ các nhánh biên trong Matcher")
  void shouldCoverMatcherBranches() {
    // isSpecialConsolation biên
    assertThat(Matcher.isSpecialConsolation(null, "123456")).isFalse();
    assertThat(Matcher.isSpecialConsolation(TICKET, null)).isFalse();
    assertThat(Matcher.isSpecialConsolation(TICKET, "12345")).isFalse(); // 5 ký tự

    // isEncouragement biên
    assertThat(Matcher.isEncouragement(null, "123456")).isFalse();
    assertThat(Matcher.isEncouragement(TICKET, null)).isFalse();
    assertThat(Matcher.isEncouragement(TICKET, "12345")).isFalse(); // 5 ký tự
  }

  @Test
  @DisplayName("phủ các nhánh biên trong CheckOutcome")
  void shouldCoverCheckOutcomeBranches() {
    // Thông báo tuỳ chỉnh không null và không rỗng
    CheckOutcome outcome =
        CheckOutcome.notAvailable(TICKET, "tp-hcm", TEST_DATE, "Thông báo bảo trì hệ thống");
    assertThat(outcome.message()).isEqualTo("Thông báo bảo trì hệ thống");
  }

  @Test
  @DisplayName("phủ các nhánh biên trong LotteryChecker")
  void shouldCoverLotteryCheckerBranches() {
    // drawResult null
    CheckOutcome outcomeNullDraw = LotteryChecker.check(TICKET, null);
    assertThat(outcomeNullDraw.isResultNotAvailable()).isTrue();
    assertThat(outcomeNullDraw.stationCode()).isEqualTo("unknown");

    // drawResult null với bảng giải thưởng chỉ định
    CheckOutcome o2 = LotteryChecker.check(TICKET, null, PrizeTable.southDefault());
    assertThat(o2.isResultNotAvailable()).isTrue();
  }

  @Test
  @DisplayName("phủ các nhánh biên trong PrizeTable")
  void shouldCoverPrizeTableBranches() {
    Map<PrizeTier, Money> map = new HashMap<>();
    map.put(null, Money.of(100));
    map.put(PrizeTier.EIGHTH, null);
    map.put(PrizeTier.SPECIAL, Money.of(2_000_000_000L));

    PrizeTable table = new PrizeTable(map);
    assertThat(table.getPrizeMoney(PrizeTier.SPECIAL)).isEqualTo(Money.of(2_000_000_000L));
    assertThat(table.getPrizeMoney(PrizeTier.EIGHTH)).isEqualTo(Money.ZERO);
  }
}
