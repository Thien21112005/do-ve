package com.dove.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ResultSource Port Contract")
class ResultSourceTest {

  /** Fake in-memory implementation of ResultSource for testing callers without network/scraper. */
  static class FakeResultSource implements ResultSource {
    private final Map<String, DrawResult> store = new HashMap<>();

    public void register(DrawResult drawResult) {
      String key = makeKey(drawResult.stationCode(), drawResult.drawDate());
      store.put(key, drawResult);
    }

    @Override
    public Optional<DrawResult> fetch(String stationCode, LocalDate drawDate) {
      String key = makeKey(stationCode, drawDate);
      return Optional.ofNullable(store.get(key));
    }

    private String makeKey(String stationCode, LocalDate drawDate) {
      return stationCode + "#" + drawDate;
    }
  }

  @Test
  @DisplayName("fetch returns empty when result is not present in source")
  void returnsEmptyWhenNotAvailable() {
    FakeResultSource source = new FakeResultSource();

    Optional<DrawResult> result = source.fetch("tp-hcm", LocalDate.of(2026, 11, 12));

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("fetch returns DrawResult when available in source")
  void returnsDrawResultWhenAvailable() {
    FakeResultSource source = new FakeResultSource();
    LocalDate date = LocalDate.of(2026, 11, 12);
    DrawResult expected =
        new DrawResult("tp-hcm", date, Map.of(PrizeTier.SPECIAL, List.of("123456")));
    source.register(expected);

    Optional<DrawResult> actual = source.fetch("tp-hcm", date);

    assertThat(actual).isPresent().contains(expected);
    assertThat(actual.get().stationCode()).isEqualTo("tp-hcm");
    assertThat(actual.get().drawDate()).isEqualTo(date);
    assertThat(actual.get().getNumbers(PrizeTier.SPECIAL)).containsExactly("123456");
  }
}
