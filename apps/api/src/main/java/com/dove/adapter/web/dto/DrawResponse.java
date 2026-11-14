package com.dove.adapter.web.dto;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** DTO for lottery draw result response (SRS 6.2). */
public record DrawResponse(
    String stationCode, LocalDate drawDate, Map<String, List<String>> numbers) {

  public static DrawResponse from(DrawResult domain) {
    Map<String, List<String>> map = new LinkedHashMap<>();
    for (PrizeTier tier : PrizeTier.values()) {
      if (tier.isDrawn()) {
        List<String> list = domain.getNumbers(tier);
        if (list != null && !list.isEmpty()) {
          map.put(tier.name(), list);
        }
      }
    }
    return new DrawResponse(domain.stationCode(), domain.drawDate(), map);
  }
}
