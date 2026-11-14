package com.dove.adapter.web.filter;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class SecurityHeadersFilterTest {

  private SecurityHeadersFilter filter;

  @BeforeEach
  void setUp() {
    filter = new SecurityHeadersFilter();
  }

  @Test
  @DisplayName("Should inject all required OWASP security headers into HTTP response")
  void shouldInjectOwaspSecurityHeaders() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain chain = (req, res) -> {};

    filter.doFilter(request, response, chain);

    assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
    assertThat(response.getHeader("X-Frame-Options")).isEqualTo("DENY");
    assertThat(response.getHeader("Referrer-Policy")).isEqualTo("strict-origin-when-cross-origin");
    assertThat(response.getHeader("X-XSS-Protection")).isEqualTo("1; mode=block");
    assertThat(response.getHeader("Content-Security-Policy"))
        .isEqualTo("default-src 'none'; frame-ancestors 'none';");
    assertThat(response.getHeader("Strict-Transport-Security"))
        .isEqualTo("max-age=31536000; includeSubDomains; preload");
  }
}
