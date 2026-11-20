package com.dove.adapter.web.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dove.adapter.web.error.RateLimitedException;
import com.dove.adapter.web.ratelimit.RateLimitInterceptor;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.handler.MappedInterceptor;
import org.springframework.web.util.ServletRequestPathUtils;

@DisplayName("T13.05 - Draw read endpoints are rate limited separately from check")
class RateLimitWiringTest {

  /** Exposes the protected registrations for assertions. */
  private static final class InspectableRegistry extends InterceptorRegistry {
    List<Object> all() {
      return getInterceptors();
    }
  }

  private static List<Object> matching(List<Object> interceptors, String path) {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
    ServletRequestPathUtils.parseAndCache(request);
    return interceptors.stream()
        .filter(i -> i instanceof MappedInterceptor m && m.matches(request))
        .map(i -> (Object) ((MappedInterceptor) i).getInterceptor())
        .toList();
  }

  @Test
  @DisplayName("check paths use the check limiter, draw paths the draw limiter, others none")
  void routesEachPathToItsOwnLimiter() {
    RateLimitConfig limits = new RateLimitConfig();
    RateLimitInterceptor check = limits.checkRateLimitInterceptor(60);
    RateLimitInterceptor draws = limits.drawRateLimitInterceptor(120);
    InspectableRegistry registry = new InspectableRegistry();

    new WebMvcConfig(check, draws).addInterceptors(registry);

    assertThat(matching(registry.all(), "/api/v1/check")).containsExactly(check);
    assertThat(matching(registry.all(), "/api/v1/check/batch")).containsExactly(check);
    assertThat(matching(registry.all(), "/api/v1/draws")).containsExactly(draws);
    assertThat(matching(registry.all(), "/api/v1/draws/latest-day")).containsExactly(draws);
    assertThat(matching(registry.all(), "/api/v1/stations")).isEmpty();
    assertThat(matching(registry.all(), "/api/v1/app/config")).isEmpty();
  }

  @Test
  @DisplayName("Draw limiter allows 120 requests per minute per IP then answers RATE_LIMITED")
  void drawLimiterRejectsRequest121() {
    RateLimitInterceptor draws = new RateLimitConfig().drawRateLimitInterceptor(120);
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/draws");
    request.setRemoteAddr("203.0.113.7");
    MockHttpServletResponse response = new MockHttpServletResponse();

    for (int i = 0; i < 120; i++) {
      assertThat(draws.preHandle(request, response, new Object())).isTrue();
    }

    assertThatThrownBy(() -> draws.preHandle(request, response, new Object()))
        .isInstanceOf(RateLimitedException.class)
        .hasMessageContaining("120")
        .hasMessageContaining("xem kết quả");
  }
}
