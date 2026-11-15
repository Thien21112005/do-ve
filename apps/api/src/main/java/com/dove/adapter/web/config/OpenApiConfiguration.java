package com.dove.adapter.web.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** OpenAPI v3 configuration and metadata for DoVe REST API (SRS 6.2). */
@Configuration
public class OpenApiConfiguration {

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("DoVe Southern Vietnam Lottery API")
                .version("1.0.0")
                .description(
                    "REST API tra cứu kết quả và dò vé số kiến thiết miền Nam chính xác 100%.")
                .contact(
                    new Contact()
                        .name("DoVe Engineering Team")
                        .url("https://github.com/thien211105/DoVe"))
                .license(
                    new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0")));
  }
}
