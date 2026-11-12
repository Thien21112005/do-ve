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

@DisplayName("Encouragement Prize Matching (BR-04)")
class EncouragementTest {

  private static final PrizeTable TABLE = PrizeTable.southDefault();
  private static final LocalDate TEST_DATE = LocalDate.of(2026, 11, 12);
  private static final String SPECIAL_NUMBER = "123456";

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
        "133456", // sai vị trí 2
        "124456", // sai vị trí 3
        "123056", // sai vị trí 4
        "123466", // sai vị trí 5
        "123450", // sai vị trí 6 (chữ số cuối)
        "193456", // sai vị trí 2 (thay bằng 9)
        "123459" // sai vị trí 6 (thay bằng 9)
      })
  @DisplayName("trúng KK khi cùng chữ số đầu với ĐB và sai đúng 1 chữ số ở từng vị trí 2..6")
  void shouldMatchEncouragementWhenDifferingByExactOneDigitInPositionsTwoThroughSix(
      String ticketStr) {
    TicketNumber ticket = new TicketNumber(ticketStr);
    DrawResult drawResult = createDrawResultWithSpecial(SPECIAL_NUMBER);

    Optional<Win> winOpt = Matcher.matchEncouragement(ticket, drawResult, TABLE);

    assertThat(winOpt).isPresent();
    Win win = winOpt.get();
    assertThat(win.tier()).isEqualTo(PrizeTier.ENCOURAGEMENT);
    assertThat(win.matchedNumber()).isEqualTo(SPECIAL_NUMBER);
    assertThat(win.prizeAmount()).isEqualTo(Money.of(6_000_000L));
  }

  @Test
  @DisplayName("vé trùng hoàn toàn với ĐB thì KHÔNG phải là giải Khuyến khích")
  void shouldNotMatchWhenTicketEqualsSpecial() {
    TicketNumber ticket = new TicketNumber(SPECIAL_NUMBER);
    DrawResult drawResult = createDrawResultWithSpecial(SPECIAL_NUMBER);

    Optional<Win> winOpt = Matcher.matchEncouragement(ticket, drawResult, TABLE);

    assertThat(winOpt).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "023456", // sai chữ số đầu (đây là Phụ ĐB, không phải KK)
        "923456", // sai chữ số đầu
        "199456", // sai 2 chữ số (vị trí 2 và 3)
        "129956", // sai 2 chữ số (vị trí 3 và 4)
        "123499", // sai 2 chữ số (vị trí 5 và 6)
        "199999", // sai 5 chữ số
        "999999" // sai toàn bộ
      })
  @DisplayName("từ chối khi sai chữ số đầu hoặc sai từ 2 chữ số trở lên")
  void shouldRejectWhenFirstDigitDiffersOrMoreThanOneDigitDiffers(String ticketStr) {
    TicketNumber ticket = new TicketNumber(ticketStr);
    DrawResult drawResult = createDrawResultWithSpecial(SPECIAL_NUMBER);

    Optional<Win> winOpt = Matcher.matchEncouragement(ticket, drawResult, TABLE);

    assertThat(winOpt).isEmpty();
  }

  @Test
  @DisplayName("xử lý chuẩn xác khi giải Đặc biệt bắt đầu bằng số 0")
  void shouldHandleSpecialPrizeWithLeadingZero() {
    String special = "012345";
    DrawResult drawResult = createDrawResultWithSpecial(special);

    // Vé sai vị trí 2 ("092345") trúng KK
    Optional<Win> win = Matcher.matchEncouragement(new TicketNumber("092345"), drawResult, TABLE);
    assertThat(win).isPresent();
    assertThat(win.get().tier()).isEqualTo(PrizeTier.ENCOURAGEMENT);

    // Vé sai số đầu ("912345") KHÔNG trúng KK (mà là Phụ ĐB)
    assertThat(Matcher.matchEncouragement(new TicketNumber("912345"), drawResult, TABLE)).isEmpty();
  }

  @Test
  @DisplayName("trả Optional empty khi kỳ quay chưa có giải Đặc biệt")
  void shouldReturnEmptyWhenNoSpecialPrizeInDraw() {
    DrawResult drawResult = createDrawResultWithSpecial(null);
    Optional<Win> win = Matcher.matchEncouragement(new TicketNumber("133456"), drawResult, TABLE);
    assertThat(win).isEmpty();
  }
}
