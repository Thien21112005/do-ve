package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Hiện thực đúng 5 ví dụ minh hoạ trong mục 3.4 tài liệu SRS: Đài tp-hcm có ĐB 654321, G1 99999, G7
 * 321, G8 21.
 */
@DisplayName("SRS Section 3.4 Worked Examples")
class WorkedExamplesSrsTest {

  private static final PrizeTable TABLE = PrizeTable.southDefault();
  private static final LocalDate DRAW_DATE = LocalDate.of(2026, 11, 9);
  private DrawResult drawResult;

  @BeforeEach
  void setUp() {
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    map.put(PrizeTier.SPECIAL, List.of("654321"));
    map.put(PrizeTier.FIRST, List.of("99999"));
    map.put(PrizeTier.SEVENTH, List.of("321"));
    map.put(PrizeTier.EIGHTH, List.of("21"));
    drawResult = new DrawResult("tp-hcm", DRAW_DATE, map);
  }

  @Test
  @DisplayName("Ví dụ 1: Vé 654321 trúng ĐB (2 tỷ) + G7 (200k) + G8 (100k) = 2.000.300.000đ")
  void example1_ticket654321() {
    TicketNumber ticket = new TicketNumber("654321");
    CheckResult result = Matcher.checkTicket(ticket, drawResult, TABLE);

    assertThat(result.isWon()).isTrue();
    assertThat(result.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(PrizeTier.SPECIAL, PrizeTier.SEVENTH, PrizeTier.EIGHTH);
    assertThat(result.totalAmount()).isEqualTo(Money.of(2_000_300_000L));
    assertThat(result.totalAmount().format()).isEqualTo("2.000.300.000đ");
  }

  @Test
  @DisplayName("Ví dụ 2: Vé 054321 trúng Phụ ĐB (50tr) + G7 (200k) + G8 (100k) = 50.300.000đ")
  void example2_ticket054321() {
    TicketNumber ticket = new TicketNumber("054321");
    CheckResult result = Matcher.checkTicket(ticket, drawResult, TABLE);

    assertThat(result.isWon()).isTrue();
    assertThat(result.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(
            PrizeTier.SPECIAL_CONSOLATION, PrizeTier.SEVENTH, PrizeTier.EIGHTH);
    assertThat(result.totalAmount()).isEqualTo(Money.of(50_300_000L));
    assertThat(result.totalAmount().format()).isEqualTo("50.300.000đ");
  }

  @Test
  @DisplayName("Ví dụ 3: Vé 654322 trúng Khuyến khích (6tr) = 6.000.000đ (sai đúng 1 số cuối)")
  void example3_ticket654322() {
    TicketNumber ticket = new TicketNumber("654322");
    CheckResult result = Matcher.checkTicket(ticket, drawResult, TABLE);

    assertThat(result.isWon()).isTrue();
    assertThat(result.wins()).extracting(Win::tier).containsExactly(PrizeTier.ENCOURAGEMENT);
    assertThat(result.totalAmount()).isEqualTo(Money.of(6_000_000L));
    assertThat(result.totalAmount().format()).isEqualTo("6.000.000đ");
  }

  @Test
  @DisplayName("Ví dụ 4: Vé 154321 trúng Phụ ĐB (50tr) + G7 (200k) + G8 (100k) = 50.300.000đ")
  void example4_ticket154321() {
    TicketNumber ticket = new TicketNumber("154321");
    CheckResult result = Matcher.checkTicket(ticket, drawResult, TABLE);

    assertThat(result.isWon()).isTrue();
    assertThat(result.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(
            PrizeTier.SPECIAL_CONSOLATION, PrizeTier.SEVENTH, PrizeTier.EIGHTH);
    assertThat(result.totalAmount()).isEqualTo(Money.of(50_300_000L));
    assertThat(result.totalAmount().format()).isEqualTo("50.300.000đ");
  }

  @Test
  @DisplayName("Ví dụ 5: Vé 111111 không trúng giải nào (0đ)")
  void example5_ticket111111() {
    TicketNumber ticket = new TicketNumber("111111");
    CheckResult result = Matcher.checkTicket(ticket, drawResult, TABLE);

    assertThat(result.isWon()).isFalse();
    assertThat(result.wins()).isEmpty();
    assertThat(result.totalAmount()).isEqualTo(Money.ZERO);
    assertThat(result.totalAmount().format()).isEqualTo("0đ");
  }
}
