package com.dove.adapter.web.ratelimit;

import com.dove.adapter.web.error.RateLimitedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Interceptor enforcing per-IP rate limiting on ticket check endpoints (NFR-04). */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

  private final SlidingWindowRateLimiter rateLimiter;
  private final int limitPerMinute;

  @org.springframework.beans.factory.annotation.Autowired
  public RateLimitInterceptor(@Value("${dove.rate-limit.check-per-minute:60}") int limitPerMinute) {
    this.limitPerMinute = limitPerMinute;
    this.rateLimiter = new SlidingWindowRateLimiter(limitPerMinute, Duration.ofMinutes(1));
  }

  public RateLimitInterceptor(SlidingWindowRateLimiter rateLimiter, int limitPerMinute) {
    this.rateLimiter = Objects.requireNonNull(rateLimiter, "rateLimiter must not be null");
    this.limitPerMinute = limitPerMinute;
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    String clientIp = resolveClientIp(request);
    if (!rateLimiter.tryAcquire(clientIp)) {
      throw new RateLimitedException(
          "Quá giới hạn " + limitPerMinute + " request/phút cho tính năng dò vé");
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
}
