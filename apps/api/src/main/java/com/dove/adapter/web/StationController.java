package com.dove.adapter.web;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.web.dto.StationResponse;
import com.dove.adapter.web.error.StationNotFoundException;
import java.util.List;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Controller exposing endpoints for Southern lottery stations. */
@RestController
@RequestMapping("/api/v1/stations")
public class StationController {

  private final StationRepository stationRepository;

  public StationController(StationRepository stationRepository) {
    this.stationRepository =
        Objects.requireNonNull(stationRepository, "stationRepository must not be null");
  }

  @GetMapping
  public ResponseEntity<List<StationResponse>> listStations(
      @RequestParam(value = "region", required = false) String region) {
    List<StationResponse> list;
    if (region != null && !region.isBlank()) {
      list =
          stationRepository.findByRegionIgnoreCase(region.trim()).stream()
              .map(StationResponse::from)
              .toList();
    } else {
      list = stationRepository.findAll().stream().map(StationResponse::from).toList();
    }
    return ResponseEntity.ok(list);
  }

  @GetMapping("/{code}")
  public ResponseEntity<StationResponse> getStation(@PathVariable("code") String code) {
    StationEntity entity =
        stationRepository.findByCode(code).orElseThrow(() -> new StationNotFoundException(code));
    return ResponseEntity.ok(StationResponse.from(entity));
  }
}
