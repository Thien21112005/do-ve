package com.dove.adapter.web.dto;

import com.dove.adapter.persistence.StationEntity;

/** DTO for station details response. */
public record StationResponse(String code, String name, String region) {

  public static StationResponse from(StationEntity entity) {
    return new StationResponse(entity.getCode(), entity.getName(), entity.getRegion());
  }
}
