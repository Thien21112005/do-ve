package com.dove.adapter.web.config;

import com.dove.adapter.web.ratelimit.RateLimitInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Independent per-IP limiters: ticket checks and draw reads. Draw reads are limited too because a
 * request for a missing past date triggers an upstream scrape (T13.05).
 */
@Configuration
public class RateLimitConfig {

  public static final String FEATURE_DRAWS = "xem kết quả";

  @Bean
  public RateLimitInterceptor checkRateLimitInterceptor(
      @Value("${dove.rate-limit.check-per-minute:60}") int perMinute) {
    return new RateLimitInterceptor(perMinute, RateLimitInterceptor.FEATURE_CHECK);
  }

  @Bean
  public RateLimitInterceptor drawRateLimitInterceptor(
      @Value("${dove.rate-limit.draws-per-minute:120}") int perMinute) {
    return new RateLimitInterceptor(perMinute, FEATURE_DRAWS);
  }
}
