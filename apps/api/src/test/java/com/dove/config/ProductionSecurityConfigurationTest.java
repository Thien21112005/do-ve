package com.dove.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

@DisplayName("T09.67 - Production Security Configuration Specification")
class ProductionSecurityConfigurationTest {

  @Test
  @DisplayName("application-prod.yml phải tắt hoàn toàn api-docs và swagger-ui")
  void prodProfile_disablesApiDocsAndSwaggerUi() throws IOException {
    YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
    List<PropertySource<?>> sources =
        loader.load("application-prod.yml", new ClassPathResource("application-prod.yml"));

    assertThat(sources).isNotEmpty();
    PropertySource<?> source = sources.get(0);

    assertThat(source.getProperty("springdoc.api-docs.enabled")).isEqualTo(false);
    assertThat(source.getProperty("springdoc.swagger-ui.enabled")).isEqualTo(false);
  }
}
