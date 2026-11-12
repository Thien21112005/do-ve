package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("LotteryChecker Facade")
class LotteryCheckerTest {

  private static final LocalDate DRAW_DATE = LocalDate.of(2026, 11, 12);
  private static final String STATION = "tp-hcm";
  private DrawResult completeDraw;

  @BeforeEach
  void setUp() {
    Map<PrizeTier, List<String>> map = new EnumMap<>(PrizeTier.class);
    map.put(PrizeTier.SPECIAL, List.of("654321"));
    map.put(PrizeTier.FIRST, List.of("12345"));
    map.put(PrizeTier.SECOND, List.of("23456"));
    map.put(PrizeTier.THIRD, List.of("34567", "45678"));
    map.put(
        PrizeTier.FOURTH, List.of("56789", "67890", "78901", "89012", "90123", "01234", "12340"));
    map.put(PrizeTier.FIFTH, List.of("2345"));
    map.put(PrizeTier.SIXTH, List.of("3456", "4567", "5678"));
    map.put(PrizeTier.SEVENTH, List.of("321"));
    map.put(PrizeTier.EIGHTH, List.of("21"));
    completeDraw = new DrawResult(STATION, DRAW_DATE, map);
  }

  @Test
  @DisplayName("dò vé thành công chỉ với 1 lời gọi facade khi có đủ 18 số")
  void shouldCheckTicketWithSingleFacadeCall() {
    CheckOutcome outcome = LotteryChecker.check(new TicketNumber("654321"), completeDraw);

    assertThat(outcome.isChecked()).isTrue();
    assertThat(outcome.getResult()).isPresent();
    CheckResult result = outcome.getResult().get();
    assertThat(result.isWon()).isTrue();
    assertThat(result.totalAmount()).isEqualTo(Money.of(2_000_300_000L));
  }

  @Test
  @DisplayName("trả RESULT_NOT_AVAILABLE khi kết quả chưa đủ 18 số (không phán vé thua)")
  void shouldReturnNotAvailableWhenDrawIsIncomplete() {
    DrawResult incompleteDraw =
        new DrawResult(STATION, DRAW_DATE, Map.of(PrizeTier.EIGHTH, List.of("21")));
    CheckOutcome outcome = LotteryChecker.check(new TicketNumber("654321"), incompleteDraw);

    assertThat(outcome.isResultNotAvailable()).isTrue();
    assertThat(outcome.getResult()).isEmpty();
    assertThat(outcome.message()).contains("Chưa có kết quả");
  }

  @Test
  @DisplayName("hỗ trợ truyền chuỗi thô cần chuẩn hoá vào facade")
  void shouldAcceptRawStringTicket() {
    CheckOutcome outcome = LotteryChecker.check(" 654-321 ", completeDraw);
    assertThat(outcome.isChecked()).isTrue();
    assertThat(outcome.ticket().value()).isEqualTo("654321");
  }

  @Test
  @DisplayName("hỗ trợ dò danh sách nhiều vé trong một lần gọi")
  void shouldCheckManyTickets() {
    List<TicketNumber> tickets = List.of(new TicketNumber("654321"), new TicketNumber("000000"));
    List<CheckOutcome> outcomes =
        LotteryChecker.checkMany(tickets, completeDraw, PrizeTable.southDefault());

    assertThat(outcomes).hasSize(2);
    assertThat(outcomes.get(0).getResult().get().isWon()).isTrue();
    assertThat(outcomes.get(1).getResult().get().isWon()).isFalse();
  }
}
