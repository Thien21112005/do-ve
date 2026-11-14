package com.dove.adapter.web.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter that applies OWASP-recommended HTTP security headers to all responses, enforcing
 * clickjacking protection, MIME type sniffing prevention, and HSTS.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-XSS-Protection", "1; mode=block");

    String uri = request.getRequestURI();
    if (uri != null && (uri.startsWith("/swagger-ui") || uri.startsWith("/v3/api-docs"))) {
      response.setHeader(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';");
    } else {
      response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");
    }

    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    filterChain.doFilter(request, response);
  }
}
