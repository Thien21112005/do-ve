package com.dove.adapter.web.filter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class CorrelationIdFilterTest {

  private CorrelationIdFilter filter;

  @BeforeEach
  void setUp() {
    filter = new CorrelationIdFilter();
    MDC.clear();
  }

  @Test
  @DisplayName(
      "Should generate new correlation UUID and put into MDC and response header when header is missing")
  void shouldGenerateNewCorrelationIdWhenHeaderMissing() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    AtomicReference<String> mdcCaptured = new AtomicReference<>();

    FilterChain chain =
        (req, res) -> {
          mdcCaptured.set(MDC.get(CorrelationIdFilter.MDC_KEY));
        };

    filter.doFilter(request, response, chain);

    String responseHeader = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);
    assertThat(responseHeader).isNotBlank();
    assertThat(mdcCaptured.get()).isEqualTo(responseHeader);
    // After filter execution, MDC must be cleared
    assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
  }

  @Test
  @DisplayName("Should reuse existing correlation id from client header in MDC and response header")
  void shouldReuseExistingCorrelationIdFromHeader() throws ServletException, IOException {
    String existingId = "client-trace-123456";
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, existingId);
    MockHttpServletResponse response = new MockHttpServletResponse();
    AtomicReference<String> mdcCaptured = new AtomicReference<>();

    FilterChain chain =
        (req, res) -> {
          mdcCaptured.set(MDC.get(CorrelationIdFilter.MDC_KEY));
        };

    filter.doFilter(request, response, chain);

    assertThat(response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).isEqualTo(existingId);
    assertThat(mdcCaptured.get()).isEqualTo(existingId);
    assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
  }

  @Test
  @DisplayName("Should cleanly remove MDC correlation ID even when filter chain throws exception")
  void shouldCleanUpMdcEvenWhenFilterChainThrowsException() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();

    FilterChain failingChain =
        (req, res) -> {
          throw new ServletException("Simulated filter failure");
        };

    assertThatThrownBy(() -> filter.doFilter(request, response, failingChain))
        .isInstanceOf(ServletException.class)
        .hasMessage("Simulated filter failure");

    assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
  }
}
