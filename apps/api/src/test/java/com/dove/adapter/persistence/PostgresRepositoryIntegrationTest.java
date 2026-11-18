package com.dove.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class PostgresRepositoryIntegrationTest {

  @Container
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withDatabaseName("dove_test")
          .withUsername("dove")
          .withPassword("dove");

  @DynamicPropertySource
  static void configureProperties(DynamicPropertyRegistry registry) {
    if (isDockerRunning()) {
      registry.add("spring.datasource.url", postgres::getJdbcUrl);
      registry.add("spring.datasource.username", postgres::getUsername);
      registry.add("spring.datasource.password", postgres::getPassword);
      registry.add("spring.flyway.enabled", () -> "true");
      registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }
  }

  static boolean isDockerRunning() {
    try {
      return DockerClientFactory.instance().isDockerAvailable();
    } catch (Throwable t) {
      return false;
    }
  }

  @Autowired private JpaDrawRepositoryAdapter drawRepositoryAdapter;
  @Autowired private StationRepository stationRepository;

  @Test
  @EnabledIf("isDockerRunning")
  @DisplayName("Chạy Flyway migration thật trên PostgreSQL 16 và kiểm tra query chính")
  void shouldWorkWithRealPostgreSqlAndFlyway() {
    long stationCount = stationRepository.count();
    assertThat(stationCount).isGreaterThanOrEqualTo(21);

    Optional<StationEntity> hcm = stationRepository.findByCode("tp-hcm");
    assertThat(hcm).isPresent();

    DrawResult draw =
        new DrawResult(
            "tp-hcm",
            LocalDate.of(2026, 11, 2),
            Map.of(
                PrizeTier.SPECIAL, List.of("654321"),
                PrizeTier.FIRST, List.of("12345"),
                PrizeTier.EIGHTH, List.of("15")));

    boolean inserted = drawRepositoryAdapter.saveIfAbsent(draw, "TESTCONTAINERS");
    assertThat(inserted).isTrue();

    Optional<DrawResult> found =
        drawRepositoryAdapter.findByStationAndDate("tp-hcm", LocalDate.of(2026, 11, 2));
    assertThat(found).isPresent();
    assertThat(found.get().getSpecialNumber()).contains("654321");
  }
}
