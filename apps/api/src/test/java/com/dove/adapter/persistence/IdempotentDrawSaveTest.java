package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class IdempotentDrawSaveTest {

  @Autowired private StationRepository stationRepository;

  @Autowired private DrawResultRepository drawResultRepository;

  @Autowired private JpaDrawRepositoryAdapter drawRepositoryAdapter;

  private DrawResult sampleDraw;

  @BeforeEach
  void setUp() {
    drawResultRepository.deleteAll();
    stationRepository.deleteAll();

    stationRepository.save(new StationEntity("tp-hcm", "TP. Hồ Chí Minh", "SOUTH"));

    Map<PrizeTier, List<String>> numbers =
        Map.of(
            PrizeTier.SPECIAL, List.of("654321"),
            PrizeTier.FIRST, List.of("99999"),
            PrizeTier.EIGHTH, List.of("15"));

    sampleDraw = new DrawResult("tp-hcm", LocalDate.of(2026, 11, 2), numbers);
  }

  @Test
  @DisplayName("Lưu idempotent tuần tự 2 lần: lần 1 trả true, lần 2 trả false, DB chỉ có 1 bản ghi")
  void shouldBeIdempotentWhenSavedSequentially() {
    boolean firstSave = drawRepositoryAdapter.saveIfAbsent(sampleDraw, "SCRAPER");
    boolean secondSave = drawRepositoryAdapter.saveIfAbsent(sampleDraw, "SCRAPER");

    assertThat(firstSave).isTrue();
    assertThat(secondSave).isFalse();

    Optional<DrawResultEntity> found =
        drawResultRepository.findByStationCodeAndDrawDate("tp-hcm", sampleDraw.drawDate());
    assertThat(found).isPresent();
    assertThat(found.get().getStation().getCode()).isEqualTo("tp-hcm");
    assertThat(drawResultRepository.count()).isEqualTo(1);
  }

  @Test
  @DisplayName("Lưu song song 2 threads: không ném exception, chỉ tạo đúng 1 bản ghi")
  void shouldBeIdempotentUnderConcurrentSaves() throws InterruptedException, ExecutionException {
    ExecutorService executor = Executors.newFixedThreadPool(2);

    Callable<Boolean> task = () -> drawRepositoryAdapter.saveIfAbsent(sampleDraw, "SCRAPER");

    Future<Boolean> f1 = executor.submit(task);
    Future<Boolean> f2 = executor.submit(task);

    boolean res1 = f1.get();
    boolean res2 = f2.get();

    // Đúng 1 luồng lưu thành công và 1 luồng nhận false
    assertThat(res1 ^ res2).isTrue();
    assertThat(drawResultRepository.count()).isEqualTo(1);

    executor.shutdown();
  }
}
