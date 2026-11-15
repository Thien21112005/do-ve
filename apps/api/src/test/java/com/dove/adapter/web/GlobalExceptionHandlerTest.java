package com.dove.adapter.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@DisplayName("T05.01 - GlobalExceptionHandler Problem Details (RFC 7807) Specification")
class GlobalExceptionHandlerTest {

  private MockMvc mockMvc;

  @RestController
  @RequestMapping("/test/errors")
  static class TestErrorController {

    @GetMapping("/response-status")
    public void throwResponseStatus() {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
    }

    @GetMapping("/unhandled")
    public void throwUnhandled() {
      throw new RuntimeException("Unexpected internal failure");
    }

    @PostMapping("/validation")
    public void throwValidation(@Valid @RequestBody DummyRequest request) {
      // no-op
    }

    @GetMapping("/param")
    public String requireParam(
        @org.springframework.web.bind.annotation.RequestParam("station") String station) {
      return station;
    }

    @GetMapping("/date")
    public String requireDate(
        @org.springframework.web.bind.annotation.RequestParam("date")
            @org.springframework.format.annotation.DateTimeFormat(
                iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
            java.time.LocalDate date) {
      return date.toString();
    }
  }

  record DummyRequest(@NotBlank(message = "name is required") String name) {}

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new TestErrorController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  @DisplayName("ResponseStatusException trả về RFC 7807 Problem Details có code")
  void responseStatusException_returnsProblemDetailsWithCode() throws Exception {
    mockMvc
        .perform(get("/test/errors/response-status"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.title").exists())
        .andExpect(jsonPath("$.detail").value("Resource not found"))
        .andExpect(jsonPath("$.code").exists());
  }

  @Test
  @DisplayName("Unhandled Exception trả về 500 Problem Details có code INTERNAL_ERROR")
  void unhandledException_returns500ProblemDetailsWithCode() throws Exception {
    mockMvc
        .perform(get("/test/errors/unhandled"))
        .andExpect(status().isInternalServerError())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.title").exists())
        .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"));
  }

  @Test
  @DisplayName("MethodArgumentNotValidException trả về 400 Problem Details có code")
  void validationException_returns400ProblemDetailsWithCode() throws Exception {
    mockMvc
        .perform(
            post("/test/errors/validation").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").exists())
        .andExpect(jsonPath("$.detail").exists());
  }

  @Test
  @DisplayName(
      "HttpMessageNotReadableException (JSON sai định dạng) trả về Problem Details có code và timestamp (T09.65)")
  void malformedJson_returnsProblemDetailsWithCodeAndTimestamp() throws Exception {
    mockMvc
        .perform(
            post("/test/errors/validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ malformed: json ]"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
        .andExpect(jsonPath("$.timestamp").exists());
  }

  @Test
  @DisplayName(
      "MissingServletRequestParameterException (thiếu tham số) trả về Problem Details có code MISSING_PARAMETER (T09.65)")
  void missingParam_returnsProblemDetailsWithCodeMissingParameter() throws Exception {
    mockMvc
        .perform(get("/test/errors/param"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.code").value("MISSING_PARAMETER"))
        .andExpect(jsonPath("$.timestamp").exists())
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("station")));
  }

  @Test
  @DisplayName(
      "handleMethodArgumentTypeMismatch làm sạch giá trị đầu vào độc hại trong detail (T09.65)")
  void typeMismatch_sanitizesInputValueInDetail() throws Exception {
    mockMvc
        .perform(
            get("/test/errors/date")
                .param(
                    "date",
                    "2026\n11\r02_extra_long_payload_string_that_exceeds_sixty_four_characters_long_for_test"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(jsonPath("$.code").value("INVALID_DATE"))
        .andExpect(
            jsonPath("$.detail")
                .value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("\n"))))
        .andExpect(
            jsonPath("$.detail")
                .value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("\r"))))
        .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.endsWith("...")));
  }
}
