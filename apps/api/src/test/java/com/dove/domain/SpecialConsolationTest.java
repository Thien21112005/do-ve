package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Special Consolation Prize Matching (BR-04)")
class SpecialConsolationTest {

  private static final PrizeTable TABLE = PrizeTable.southDefault();
  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);
  private static final String SPECIAL_NUMBER = "654321";

  private DrawResult createDrawResultWithSpecial(String special) {
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    if (special != null) {
      map.put(PrizeTier.SPECIAL, List.of(special));
    }
    return new DrawResult("tp-hcm", TEST_DATE, map);
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "054321", "154321", "254321", "354321", "454321", "554321", "754321", "854321", "954321"
      })
  @DisplayName("trúng Phụ ĐB khi trùng 5 số cuối và chữ số đầu từ 0-9 khác chữ số đầu của ĐB")
  void shouldMatchSpecialConsolationForEveryDifferentFirstDigit(String ticketStr) {
    TicketNumber ticket = new TicketNumber(ticketStr);
    DrawResult drawResult = createDrawResultWithSpecial(SPECIAL_NUMBER);

    Optional<Win> winOpt = Matcher.matchSpecialConsolation(ticket, drawResult, TABLE);

    assertThat(winOpt).isPresent();
    Win win = winOpt.get();
    assertThat(win.tier()).isEqualTo(PrizeTier.SPECIAL_CONSOLATION);
    assertThat(win.matchedNumber()).isEqualTo(SPECIAL_NUMBER);
    assertThat(win.prizeAmount()).isEqualTo(Money.of(50_000_000L));
  }

  @Test
  @DisplayName("vé trùng hoàn toàn với giải Đặc biệt KHÔNG được coi là trúng giải Phụ ĐB")
  void shouldNotMatchWhenTicketEqualsSpecialPrize() {
    TicketNumber ticket = new TicketNumber(SPECIAL_NUMBER);
    DrawResult drawResult = createDrawResultWithSpecial(SPECIAL_NUMBER);

    Optional<Win> winOpt = Matcher.matchSpecialConsolation(ticket, drawResult, TABLE);

    assertThat(winOpt).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "054320", // sai chữ số đầu và sai chữ số cuối
        "654320", // chữ số đầu đúng nhưng sai số cuối
        "004321", // sai 2 chữ số đầu
        "123456" // khác biệt hoàn toàn
      })
  @DisplayName("không trúng Phụ ĐB khi sai từ 2 chữ số trở lên hoặc sai chữ số khác chữ số đầu")
  void shouldNotMatchWhenMoreThanFirstDigitDiffers(String ticketStr) {
    TicketNumber ticket = new TicketNumber(ticketStr);
    DrawResult drawResult = createDrawResultWithSpecial(SPECIAL_NUMBER);

    Optional<Win> winOpt = Matcher.matchSpecialConsolation(ticket, drawResult, TABLE);

    assertThat(winOpt).isEmpty();
  }

  @Test
  @DisplayName("hoạt động chính xác khi giải Đặc biệt bắt đầu bằng số 0")
  void shouldHandleSpecialPrizeWithLeadingZero() {
    String special = "012345";
    DrawResult drawResult = createDrawResultWithSpecial(special);

    // Vé trùng ĐB
    assertThat(Matcher.matchSpecialConsolation(new TicketNumber("012345"), drawResult, TABLE))
        .isEmpty();

    // Vé trúng Phụ ĐB (chữ số đầu là '9', 5 số cuối là "12345")
    Optional<Win> win =
        Matcher.matchSpecialConsolation(new TicketNumber("912345"), drawResult, TABLE);
    assertThat(win).isPresent();
    assertThat(win.get().tier()).isEqualTo(PrizeTier.SPECIAL_CONSOLATION);
  }

  @Test
  @DisplayName("trả Optional empty khi kỳ quay chưa có giải Đặc biệt")
  void shouldReturnEmptyWhenNoSpecialPrizeInDraw() {
    DrawResult drawResult = createDrawResultWithSpecial(null);
    Optional<Win> win =
        Matcher.matchSpecialConsolation(new TicketNumber("054321"), drawResult, TABLE);
    assertThat(win).isEmpty();
  }
}
