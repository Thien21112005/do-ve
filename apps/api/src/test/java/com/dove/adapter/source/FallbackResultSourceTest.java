package com.dove.adapter.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dove.application.ResultSource;
import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("FallbackResultSource Specification (T04.22)")
class FallbackResultSourceTest {

  private ResultSource primarySource;
  private ResultSource secondarySource;
  private FallbackResultSource fallbackSource;
  private final LocalDate drawDate = LocalDate.of(2026, 11, 2);
  private final String stationCode = "tp-hcm";
  private final DrawResult sampleResult =
      new DrawResult(stationCode, drawDate, Map.of(PrizeTier.SPECIAL, List.of("482915")));

  @BeforeEach
  void setUp() {
    primarySource = mock(ResultSource.class);
    secondarySource = mock(ResultSource.class);
    fallbackSource = new FallbackResultSource(List.of(primarySource, secondarySource));
  }

  @Test
  @DisplayName("Khi nguồn chính thành công, lấy từ nguồn chính và không gọi nguồn dự phòng")
  void primarySuccess_doesNotCallSecondary() {
    when(primarySource.fetch(stationCode, drawDate)).thenReturn(Optional.of(sampleResult));

    Optional<DrawResult> result = fallbackSource.fetch(stationCode, drawDate);

    assertThat(result).contains(sampleResult);
    verify(primarySource).fetch(stationCode, drawDate);
    verify(secondarySource, never()).fetch(stationCode, drawDate);
  }

  @Test
  @DisplayName("Khi nguồn chính trả về empty, chuyển sang nguồn dự phòng")
  void primaryEmpty_fallsBackToSecondary() {
    when(primarySource.fetch(stationCode, drawDate)).thenReturn(Optional.empty());
    when(secondarySource.fetch(stationCode, drawDate)).thenReturn(Optional.of(sampleResult));

    Optional<DrawResult> result = fallbackSource.fetch(stationCode, drawDate);

    assertThat(result).contains(sampleResult);
    verify(primarySource).fetch(stationCode, drawDate);
    verify(secondarySource).fetch(stationCode, drawDate);
  }

  @Test
  @DisplayName("Khi nguồn chính ném ngoại lệ, tự động bắt lỗi và gọi nguồn dự phòng")
  void primaryException_fallsBackToSecondary() {
    when(primarySource.fetch(stationCode, drawDate))
        .thenThrow(new RuntimeException("Kết nối nguồn chính bị gián đoạn"));
    when(secondarySource.fetch(stationCode, drawDate)).thenReturn(Optional.of(sampleResult));

    Optional<DrawResult> result = fallbackSource.fetch(stationCode, drawDate);

    assertThat(result).contains(sampleResult);
    verify(primarySource).fetch(stationCode, drawDate);
    verify(secondarySource).fetch(stationCode, drawDate);
  }

  @Test
  @DisplayName("Khi cả hai nguồn đều thất bại, trả về Optional.empty")
  void allSourcesFail_returnsEmpty() {
    when(primarySource.fetch(stationCode, drawDate)).thenReturn(Optional.empty());
    when(secondarySource.fetch(stationCode, drawDate))
        .thenThrow(new RuntimeException("Nguồn dự phòng sập"));

    Optional<DrawResult> result = fallbackSource.fetch(stationCode, drawDate);

    assertThat(result).isEmpty();
    verify(primarySource).fetch(stationCode, drawDate);
    verify(secondarySource).fetch(stationCode, drawDate);
  }
}
