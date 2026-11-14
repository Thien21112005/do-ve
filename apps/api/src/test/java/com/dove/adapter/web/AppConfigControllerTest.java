package com.dove.adapter.web;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dove.adapter.web.config.AppConfigProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@DisplayName("T05.14 - GET /api/v1/app/config Specification")
class AppConfigControllerTest {

  @Test
  @DisplayName(
      "Cấu hình mặc định trả về minSupportedVersion=1.0.0, maintenance=false, message=null")
  void getConfig_defaultProperties_success() throws Exception {
    AppConfigProperties properties = new AppConfigProperties("1.0.0", false, null);
    AppConfigController controller = new AppConfigController(properties);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/v1/app/config"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.minSupportedVersion").value("1.0.0"))
        .andExpect(jsonPath("$.maintenance").value(false))
        .andExpect(jsonPath("$.message").value(nullValue()));
  }

  @Test
  @DisplayName("Khi bật bảo trì, trả về maintenance=true kèm thông điệp thông báo")
  void getConfig_maintenanceMode_success() throws Exception {
    AppConfigProperties properties =
        new AppConfigProperties("1.2.0", true, "Hệ thống đang bảo trì máy chủ đến 17h00");
    AppConfigController controller = new AppConfigController(properties);
    MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    mockMvc
        .perform(get("/api/v1/app/config"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.minSupportedVersion").value("1.2.0"))
        .andExpect(jsonPath("$.maintenance").value(true))
        .andExpect(jsonPath("$.message").value("Hệ thống đang bảo trì máy chủ đến 17h00"));
  }
}
