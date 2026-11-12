package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

@DisplayName("Standard Prize Tiers Matching")
class StandardTierMatchingTest {

  private static final PrizeTable TABLE = PrizeTable.southDefault();
  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);

  @ParameterizedTest(name = "{0}: vé {1} trúng số {2}")
  @CsvSource({
    "SPECIAL, 654321, 654321, 2000000000",
    "FIRST, 012345, 12345, 30000000",
    "SECOND, 023456, 23456, 15000000",
    "THIRD, 034567, 34567, 10000000",
    "FOURTH, 045678, 45678, 3000000",
    "FIFTH, 005678, 5678, 1000000",
    "SIXTH, 006789, 6789, 400000",
    "SEVENTH, 000789, 789, 200000",
    "EIGHTH, 000089, 89, 100000"
  })
  @DisplayName("khớp chính xác từng giải thường trong 9 giải bốc thăm")
  void shouldMatchEachStandardTier(
      PrizeTier tier, String ticketStr, String prizeNumber, long expectedVnd) {
    TicketNumber ticket = new TicketNumber(ticketStr);
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    map.put(tier, List.of(prizeNumber));
    DrawResult drawResult = new DrawResult("tp-hcm", TEST_DATE, map);

    List<Win> wins = Matcher.matchStandardTiers(ticket, drawResult, TABLE);

    assertThat(wins).hasSize(1);
    Win win = wins.getFirst();
    assertThat(win.tier()).isEqualTo(tier);
    assertThat(win.matchedNumber()).isEqualTo(prizeNumber);
    assertThat(win.prizeAmount()).isEqualTo(Money.of(expectedVnd));
  }

  @ParameterizedTest(name = "{0}: vé {1} trượt số {2}")
  @CsvSource({
    "SPECIAL, 654320, 654321",
    "FIRST, 012340, 12345",
    "SECOND, 023450, 23456",
    "THIRD, 034560, 34567",
    "FOURTH, 045670, 45678",
    "FIFTH, 005670, 5678",
    "SIXTH, 006780, 6789",
    "SEVENTH, 000780, 789",
    "EIGHTH, 000080, 89"
  })
  @DisplayName("không khớp khi số vé sai hậu tố")
  void shouldNotMatchWhenSuffixDiffers(PrizeTier tier, String ticketStr, String prizeNumber) {
    TicketNumber ticket = new TicketNumber(ticketStr);
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    map.put(tier, List.of(prizeNumber));
    DrawResult drawResult = new DrawResult("tp-hcm", TEST_DATE, map);

    List<Win> wins = Matcher.matchStandardTiers(ticket, drawResult, TABLE);

    assertThat(wins).isEmpty();
  }
}
