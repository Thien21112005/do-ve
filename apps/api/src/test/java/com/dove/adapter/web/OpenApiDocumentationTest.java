package com.dove.adapter.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.adapter.web.config.OpenApiConfiguration;
import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T05.18 - OpenAPI + Swagger UI Documentation Specification")
class OpenApiDocumentationTest {

  @Test
  @DisplayName("Cấu hình OpenAPI khởi tạo đúng thông tin tiêu đề, phiên bản và liên hệ theo SRS")
  void openApiConfiguration_containsCorrectMetadata() {
    OpenApiConfiguration config = new OpenApiConfiguration();
    OpenAPI openAPI = config.customOpenAPI();

    assertThat(openAPI.getInfo()).isNotNull();
    assertThat(openAPI.getInfo().getTitle()).isEqualTo("DoVe Southern Vietnam Lottery API");
    assertThat(openAPI.getInfo().getVersion()).isEqualTo("1.0.0");
    assertThat(openAPI.getInfo().getDescription()).contains("100%");
    assertThat(openAPI.getInfo().getContact()).isNotNull();
    assertThat(openAPI.getInfo().getContact().getName()).isEqualTo("DoVe Engineering Team");
    assertThat(openAPI.getInfo().getLicense().getName()).isEqualTo("Apache 2.0");
  }
}
