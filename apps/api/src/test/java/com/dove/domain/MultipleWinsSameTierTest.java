package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Multiple Wins Within Same Tier (BR-03)")
class MultipleWinsSameTierTest {

  private static final PrizeTable TABLE = PrizeTable.southDefault();
  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);

  @Test
  @DisplayName("vé khớp 2 số trong cùng giải Tư (G4) tạo đúng 2 Win độc lập")
  void shouldCreateTwoWinsWhenMatchingTwoNumbersInFourthTier() {
    TicketNumber ticket = new TicketNumber("012345");

    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    // Giả sử G4 có 2 số cùng khớp hậu tố "12345"
    map.put(
        PrizeTier.FOURTH, List.of("12345", "12345", "56789", "67890", "78901", "89012", "90123"));
    DrawResult drawResult = new DrawResult("tp-hcm", TEST_DATE, map);

    List<Win> wins = Matcher.matchStandardTiers(ticket, drawResult, TABLE);

    assertThat(wins).hasSize(2);
    assertThat(wins).extracting(Win::tier).containsExactly(PrizeTier.FOURTH, PrizeTier.FOURTH);
    assertThat(wins).extracting(Win::matchedNumber).containsExactly("12345", "12345");
    assertThat(wins)
        .extracting(Win::prizeAmount)
        .containsExactly(Money.of(3_000_000L), Money.of(3_000_000L));
  }

  @Test
  @DisplayName("vé khớp 2 số trong cùng giải Sáu (G6) tạo đúng 2 Win độc lập")
  void shouldCreateTwoWinsWhenMatchingTwoNumbersInSixthTier() {
    TicketNumber ticket = new TicketNumber("991234");

    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    map.put(PrizeTier.SIXTH, List.of("1234", "1234", "9999"));
    DrawResult drawResult = new DrawResult("tp-hcm", TEST_DATE, map);

    List<Win> wins = Matcher.matchStandardTiers(ticket, drawResult, TABLE);

    assertThat(wins).hasSize(2);
    assertThat(wins)
        .extracting(Win::prizeAmount)
        .containsExactly(Money.of(400_000L), Money.of(400_000L));
  }
}
