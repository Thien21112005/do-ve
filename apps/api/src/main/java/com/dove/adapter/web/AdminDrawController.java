package com.dove.adapter.web;

import com.dove.adapter.web.dto.AdminUpsertDrawRequest;
import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import com.dove.domain.InvalidDrawResultException;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Administrative REST controller for manually entering or overriding lottery draw results.
 * Protected by X-API-Key with constant-time equality check.
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminDrawController {

  private final DrawRepository drawRepository;
  private final String configuredApiKey;

  public AdminDrawController(
      DrawRepository drawRepository,
      @Value("${dove.admin.api-key:dove-admin-secret-key}") String configuredApiKey) {
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.configuredApiKey =
        Objects.requireNonNull(configuredApiKey, "configuredApiKey must not be null");
  }

  @PutMapping("/draws")
  public ResponseEntity<Map<String, Object>> upsertDraw(
      @RequestHeader(value = "X-API-Key", required = false) String apiKeyHeader,
      @Valid @RequestBody AdminUpsertDrawRequest request) {

    verifyApiKey(apiKeyHeader);

    try {
      DrawResult domain =
          new DrawResult(request.stationCode(), request.drawDate(), request.prizes());
      domain.validate();

      DrawResult saved = drawRepository.save(domain, "ADMIN_MANUAL");

      int totalNumbers = saved.numbers().values().stream().mapToInt(List::size).sum();

      return ResponseEntity.ok(
          Map.of(
              "status",
              "success",
              "stationCode",
              saved.stationCode(),
              "drawDate",
              saved.drawDate().toString(),
              "totalNumbers",
              totalNumbers));
    } catch (InvalidDrawResultException | IllegalArgumentException | IllegalStateException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
    }
  }

  private void verifyApiKey(String providedKey) {
    if (providedKey == null || providedKey.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-API-Key header");
    }

    byte[] providedBytes = providedKey.getBytes(StandardCharsets.UTF_8);
    byte[] expectedBytes = configuredApiKey.getBytes(StandardCharsets.UTF_8);

    if (!MessageDigest.isEqual(providedBytes, expectedBytes)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid X-API-Key header");
    }
  }
}
