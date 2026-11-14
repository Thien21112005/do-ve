package com.dove.adapter.web.config;

import com.dove.adapter.web.ratelimit.RateLimitInterceptor;
import java.util.Objects;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Spring Web MVC configuration registering interceptors. */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  private final RateLimitInterceptor rateLimitInterceptor;

  public WebMvcConfig(RateLimitInterceptor rateLimitInterceptor) {
    this.rateLimitInterceptor =
        Objects.requireNonNull(rateLimitInterceptor, "rateLimitInterceptor must not be null");
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(rateLimitInterceptor)
        .addPathPatterns("/api/v1/check", "/api/v1/check/**");
  }
}
