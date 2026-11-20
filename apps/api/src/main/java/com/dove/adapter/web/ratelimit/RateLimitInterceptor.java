package com.dove.adapter.web.ratelimit;

import com.dove.adapter.web.error.RateLimitedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Objects;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Per-IP rate limiting interceptor (NFR-04). One instance per protected feature, wired in {@link
 * com.dove.adapter.web.config.RateLimitConfig}: ticket check and draw reads (T13.05).
 */
public class RateLimitInterceptor implements HandlerInterceptor {

  public static final String FEATURE_CHECK = "dò vé";

  private final SlidingWindowRateLimiter rateLimiter;
  private final int limitPerMinute;
  private final String featureLabel;

  public RateLimitInterceptor(int limitPerMinute, String featureLabel) {
    this(
        new SlidingWindowRateLimiter(limitPerMinute, Duration.ofMinutes(1)),
        limitPerMinute,
        featureLabel);
  }

  public RateLimitInterceptor(SlidingWindowRateLimiter rateLimiter, int limitPerMinute) {
    this(rateLimiter, limitPerMinute, FEATURE_CHECK);
  }

  public RateLimitInterceptor(
      SlidingWindowRateLimiter rateLimiter, int limitPerMinute, String featureLabel) {
    this.rateLimiter = Objects.requireNonNull(rateLimiter, "rateLimiter must not be null");
    this.limitPerMinute = limitPerMinute;
    this.featureLabel = Objects.requireNonNull(featureLabel, "featureLabel must not be null");
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    String clientIp = resolveClientIp(request);
    if (!rateLimiter.tryAcquire(clientIp)) {
      throw new RateLimitedException(
          "Quá giới hạn " + limitPerMinute + " request/phút cho tính năng " + featureLabel);
    }
    return true;
  }

  private String resolveClientIp(HttpServletRequest request) {
    // Rely on request.getRemoteAddr(), which is populated correctly by Spring / Tomcat
    // RemoteIpValve (server.forward-headers-strategy: native) from trusted reverse proxy hops (e.g.
    // Caddy).
    // Never trust raw client-provided X-Forwarded-For headers directly to prevent rate-limit
    // spoofing.
    String remoteAddr = request.getRemoteAddr();
    if (remoteAddr != null && !remoteAddr.isBlank()) {
      return remoteAddr.trim();
    }
    return "unknown";
  }

  public SlidingWindowRateLimiter getRateLimiter() {
    return rateLimiter;
  }

  @org.springframework.scheduling.annotation.Scheduled(
      fixedDelayString = "${dove.rate-limit.cleanup-interval-ms:60000}")
  public void cleanupExpiredEntries() {
    rateLimiter.evictExpired();
  }
}
