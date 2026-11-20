package com.dove.adapter.web.config;

import com.dove.adapter.web.ratelimit.RateLimitInterceptor;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Spring Web MVC configuration registering interceptors. */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  private final RateLimitInterceptor checkRateLimitInterceptor;
  private final RateLimitInterceptor drawRateLimitInterceptor;

  public WebMvcConfig(
      @Qualifier("checkRateLimitInterceptor") RateLimitInterceptor checkRateLimitInterceptor,
      @Qualifier("drawRateLimitInterceptor") RateLimitInterceptor drawRateLimitInterceptor) {
    this.checkRateLimitInterceptor =
        Objects.requireNonNull(checkRateLimitInterceptor, "checkRateLimitInterceptor is required");
    this.drawRateLimitInterceptor =
        Objects.requireNonNull(drawRateLimitInterceptor, "drawRateLimitInterceptor is required");
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(checkRateLimitInterceptor)
        .addPathPatterns("/api/v1/check", "/api/v1/check/**");
    registry
        .addInterceptor(drawRateLimitInterceptor)
        .addPathPatterns("/api/v1/draws", "/api/v1/draws/**");
  }
}
