package com.dove.adapter.web.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuration properties for mobile client compatibility and maintenance mode. */
@ConfigurationProperties(prefix = "dove.app")
public record AppConfigProperties(String minSupportedVersion, boolean maintenance, String message) {

  public AppConfigProperties {
    if (minSupportedVersion == null || minSupportedVersion.isBlank()) {
      minSupportedVersion = "1.0.0";
    }
  }
}
