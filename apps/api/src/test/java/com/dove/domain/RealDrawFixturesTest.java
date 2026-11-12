package com.dove.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Real Draw Fixtures Verification")
class RealDrawFixturesTest {

  private static final Pattern STATION_PATTERN =
      Pattern.compile("\"stationCode\"\\s*:\\s*\"([^\"]+)\"");
  private static final Pattern DATE_PATTERN = Pattern.compile("\"drawDate\"\\s*:\\s*\"([^\"]+)\"");
  private static final Pattern TIER_PATTERN =
      Pattern.compile("\"([A-Z_]+)\"\\s*:\\s*\\[([^\\]]+)\\]");
  private static final Pattern NUM_PATTERN = Pattern.compile("\"([0-9]+)\"");

  private DrawResult loadFixture(String filename) throws Exception {
    try (InputStream is = getClass().getResourceAsStream("/fixtures/" + filename)) {
      assertThat(is).as("Fixture file /fixtures/" + filename + " must exist").isNotNull();

      String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);

      Matcher stationMatcher = STATION_PATTERN.matcher(json);
      assertThat(stationMatcher.find()).isTrue();
      String stationCode = stationMatcher.group(1);

      Matcher dateMatcher = DATE_PATTERN.matcher(json);
      assertThat(dateMatcher.find()).isTrue();
      LocalDate drawDate = LocalDate.parse(dateMatcher.group(1));

      Map<PrizeTier, List<String>> numbers = new EnumMap<>(PrizeTier.class);
      Matcher tierMatcher = TIER_PATTERN.matcher(json);
      while (tierMatcher.find()) {
        String tierName = tierMatcher.group(1);
        String numbersContent = tierMatcher.group(2);
        PrizeTier tier = PrizeTier.valueOf(tierName);

        List<String> list = new ArrayList<>();
        Matcher numMatcher = NUM_PATTERN.matcher(numbersContent);
        while (numMatcher.find()) {
          list.add(numMatcher.group(1));
        }
        numbers.put(tier, list);
      }

      DrawResult drawResult = new DrawResult(stationCode, drawDate, numbers);
      drawResult.validate();
      return drawResult;
    }
  }

  @Test
  @DisplayName("Kỳ quay thật TP.HCM (2026-11-02): kiểm tra đối chiếu thủ công các kịch bản")
  void shouldVerifyTpHcmFixture() throws Exception {
    DrawResult draw = loadFixture("draw_tp-hcm_2026-11-02.json");
    assertThat(draw.isComplete()).isTrue();

    // 1. Vé trúng ĐB 482915: trúng ĐB (2 tỷ) + G8 (15: 100k) = 2.000.100.000đ
    CheckOutcome r1 = LotteryChecker.check(new TicketNumber("482915"), draw);
    assertThat(r1.isChecked()).isTrue();
    CheckResult cr1 = r1.getResult().orElseThrow();
    assertThat(cr1.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(PrizeTier.SPECIAL, PrizeTier.EIGHTH);
    assertThat(cr1.totalAmount()).isEqualTo(Money.of(2_000_100_000L));

    // 2. Vé trúng Phụ ĐB 082915: trúng Phụ ĐB (50tr) + G8 (15: 100k) = 50.100.000đ
    CheckOutcome r2 = LotteryChecker.check(new TicketNumber("082915"), draw);
    CheckResult cr2 = r2.getResult().orElseThrow();
    assertThat(cr2.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(PrizeTier.SPECIAL_CONSOLATION, PrizeTier.EIGHTH);
    assertThat(cr2.totalAmount()).isEqualTo(Money.of(50_100_000L));

    // 3. Vé trúng KK 482916 (sai số cuối): 6.000.000đ
    CheckOutcome r3 = LotteryChecker.check(new TicketNumber("482916"), draw);
    CheckResult cr3 = r3.getResult().orElseThrow();
    assertThat(cr3.wins()).extracting(Win::tier).containsExactly(PrizeTier.ENCOURAGEMENT);
    assertThat(cr3.totalAmount()).isEqualTo(Money.of(6_000_000L));

    // 4. Vé trúng G7 000395 (khớp 395): 200.000đ
    CheckOutcome r4 = LotteryChecker.check(new TicketNumber("000395"), draw);
    CheckResult cr4 = r4.getResult().orElseThrow();
    assertThat(cr4.wins()).extracting(Win::tier).containsExactly(PrizeTier.SEVENTH);
    assertThat(cr4.totalAmount()).isEqualTo(Money.of(200_000L));

    // 5. Vé trượt hoàn toàn
    CheckOutcome r5 = LotteryChecker.check(new TicketNumber("999999"), draw);
    assertThat(r5.getResult().orElseThrow().isWon()).isFalse();
  }

  @Test
  @DisplayName("Kỳ quay thật Đồng Tháp (2026-11-02): ĐB có số 0 đầu (019283)")
  void shouldVerifyDongThapFixtureWithLeadingZeroSpecial() throws Exception {
    DrawResult draw = loadFixture("draw_dong-thap_2026-11-02.json");
    assertThat(draw.isComplete()).isTrue();

    // 1. Vé 019283: trúng ĐB (2 tỷ) + G6 (9283: 400k) + G7 (283: 200k) + G8 (83: 100k) =
    // 2.000.700.000đ
    CheckOutcome r1 = LotteryChecker.check(new TicketNumber("019283"), draw);
    CheckResult cr1 = r1.getResult().orElseThrow();
    assertThat(cr1.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(
            PrizeTier.SPECIAL, PrizeTier.SIXTH, PrizeTier.SEVENTH, PrizeTier.EIGHTH);
    assertThat(cr1.totalAmount()).isEqualTo(Money.of(2_000_700_000L));

    // 2. Vé 819283: trúng Phụ ĐB (50tr) + G6 + G7 + G8 = 50.700.000đ
    CheckOutcome r2 = LotteryChecker.check(new TicketNumber("819283"), draw);
    CheckResult cr2 = r2.getResult().orElseThrow();
    assertThat(cr2.wins())
        .extracting(Win::tier)
        .containsExactlyInAnyOrder(
            PrizeTier.SPECIAL_CONSOLATION, PrizeTier.SIXTH, PrizeTier.SEVENTH, PrizeTier.EIGHTH);
    assertThat(cr2.totalAmount()).isEqualTo(Money.of(50_700_000L));
  }

  @Test
  @DisplayName("Kỳ quay thật Cà Mau (2026-11-02): kiểm tra giải Tám và giải Bảy")
  void shouldVerifyCaMauFixture() throws Exception {
    DrawResult draw = loadFixture("draw_ca-mau_2026-11-02.json");
    assertThat(draw.isComplete()).isTrue();

    // 1. Vé 928174: ĐB (2 tỷ) + G7 (174: 200k) + G8 (74: 100k) = 2.000.300.000đ
    CheckOutcome r1 = LotteryChecker.check(new TicketNumber("928174"), draw);
    CheckResult cr1 = r1.getResult().orElseThrow();
    assertThat(cr1.totalAmount()).isEqualTo(Money.of(2_000_300_000L));

    // 2. Vé 000074: trúng G8 (100k)
    CheckOutcome r2 = LotteryChecker.check(new TicketNumber("000074"), draw);
    CheckResult cr2 = r2.getResult().orElseThrow();
    assertThat(cr2.wins()).extracting(Win::tier).containsExactly(PrizeTier.EIGHTH);
    assertThat(cr2.totalAmount()).isEqualTo(Money.of(100_000L));
  }
}
