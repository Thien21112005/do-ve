package com.dove.adapter.web.dto;

/** DTO representing client application configuration and maintenance status (SRS 6.2). */
public record AppConfigResponse(String minSupportedVersion, boolean maintenance, String message) {}
