package com.dove.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

@DisplayName("T13.14 - Error details are hidden with Spring Boot 4 property keys")
class ErrorExposureConfigurationTest {

  private static PropertySource<?> applicationYml() throws IOException {
    List<PropertySource<?>> sources =
        new YamlPropertySourceLoader()
            .load("application.yml", new ClassPathResource("application.yml"));
    assertThat(sources).isNotEmpty();
    return sources.get(0);
  }

  @Test
  @DisplayName("spring.web.error.* hides stacktrace, message and binding errors")
  void usesBoot4Keys() throws IOException {
    PropertySource<?> yml = applicationYml();

    assertThat(yml.getProperty("spring.web.error.include-stacktrace")).isEqualTo("never");
    assertThat(yml.getProperty("spring.web.error.include-message")).isEqualTo("never");
    assertThat(yml.getProperty("spring.web.error.include-binding-errors")).isEqualTo("never");
  }

  @Test
  @DisplayName("Deprecated server.error.include-* keys are gone")
  void dropsDeprecatedKeys() throws IOException {
    PropertySource<?> yml = applicationYml();

    assertThat(yml.getProperty("server.error.include-stacktrace")).isNull();
    assertThat(yml.getProperty("server.error.include-message")).isNull();
    assertThat(yml.getProperty("server.error.include-binding-errors")).isNull();
  }
}
