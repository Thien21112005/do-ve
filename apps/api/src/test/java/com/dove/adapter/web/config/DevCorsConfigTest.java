package com.dove.adapter.web.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Profile;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@DisplayName("T13.00 - Dev-only CORS for Expo Web")
class DevCorsConfigTest {

  /** Exposes the protected registrations for assertions. */
  private static final class InspectableCorsRegistry extends CorsRegistry {
    Map<String, CorsConfiguration> configs() {
      return getCorsConfigurations();
    }
  }

  @Test
  @DisplayName("Allows configured Expo Web origins on /api/** for GET, POST and OPTIONS")
  void allowsExpoWebOriginsOnApi() {
    DevCorsConfig config = new DevCorsConfig("http://localhost:8081, http://localhost:19006");
    InspectableCorsRegistry registry = new InspectableCorsRegistry();

    config.addCorsMappings(registry);

    assertThat(registry.configs()).containsOnlyKeys("/api/**");
    CorsConfiguration api = registry.configs().get("/api/**");
    assertThat(api.getAllowedOrigins())
        .containsExactly("http://localhost:8081", "http://localhost:19006");
    assertThat(api.getAllowedMethods()).containsExactlyInAnyOrder("GET", "POST", "OPTIONS");
    assertThat(api.checkOrigin("http://localhost:8081")).isEqualTo("http://localhost:8081");
    assertThat(api.checkOrigin("https://evil.example")).isNull();
    assertThat(api.getAllowCredentials()).isNotEqualTo(Boolean.TRUE);
  }

  @Test
  @DisplayName("Is only active under the dev profile, never in prod")
  void isDevProfileOnly() {
    Profile profile = DevCorsConfig.class.getAnnotation(Profile.class);

    assertThat(profile).isNotNull();
    assertThat(profile.value()).containsExactly("dev");
  }
}
