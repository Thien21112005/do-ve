package com.dove.adapter.web.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Dev-only CORS so the Expo Web build (http://localhost:8081) can call the local API from a
 * browser. Never active in prod: native apps do not need CORS.
 */
@Configuration
@Profile("dev")
public class DevCorsConfig implements WebMvcConfigurer {

  private final String[] allowedOrigins;

  public DevCorsConfig(
      @Value("${dove.cors.allowed-origins:http://localhost:8081,http://localhost:19006}")
          String allowedOrigins) {
    this.allowedOrigins =
        Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toArray(String[]::new);
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
        .addMapping("/api/**")
        .allowedOrigins(allowedOrigins)
        .allowedMethods("GET", "POST", "OPTIONS")
        .exposedHeaders("ETag", "X-Request-Id");
  }
}
