package com.dove.adapter.web;

import com.dove.adapter.web.config.AppConfigProperties;
import com.dove.adapter.web.dto.AppConfigResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST controller exposing application configuration and maintenance state. */
@RestController
@RequestMapping("/api/v1/app")
@Tag(name = "App", description = "Cấu hình ứng dụng và trạng thái hệ thống")
public class AppConfigController {

  private final AppConfigProperties properties;

  public AppConfigController(AppConfigProperties properties) {
    this.properties = Objects.requireNonNull(properties, "properties must not be null");
  }

  @GetMapping("/config")
  @Operation(
      summary = "Cấu hình ứng dụng",
      description =
          "Trả về phiên bản ứng dụng tối thiểu được hỗ trợ và trạng thái bảo trì của hệ thống (SRS 6.2)")
  public ResponseEntity<AppConfigResponse> getConfig() {
    String msg =
        (properties.message() == null || properties.message().isBlank())
            ? null
            : properties.message();
    return ResponseEntity.ok(
        new AppConfigResponse(properties.minSupportedVersion(), properties.maintenance(), msg));
  }
}
