package com.dove.adapter.web;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.web.dto.StationResponse;
import com.dove.adapter.web.error.StationNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Stations", description = "Quản lý và tra cứu thông tin các đài xổ số kiến thiết")
public class StationController {

  private final StationRepository stationRepository;

  public StationController(StationRepository stationRepository) {
    this.stationRepository =
        Objects.requireNonNull(stationRepository, "stationRepository must not be null");
  }

  @GetMapping
  @Operation(
      summary = "Danh sách đài xổ số",
      description =
          "Trả về danh sách các đài xổ số, có thể lọc theo miền (mặc định miền Nam - SOUTH)")
  public ResponseEntity<List<StationResponse>> listStations(
      @Parameter(description = "Miền cần lọc (ví dụ: SOUTH)")
          @RequestParam(value = "region", required = false)
          String region) {
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
  @Operation(
      summary = "Chi tiết một đài xổ số",
      description = "Tra cứu thông tin chi tiết một đài theo mã (ví dụ: tp-hcm, dong-nai)")
  public ResponseEntity<StationResponse> getStation(
      @Parameter(description = "Mã đài (slug)") @PathVariable("code") String code) {
    StationEntity entity =
        stationRepository.findByCode(code).orElseThrow(() -> new StationNotFoundException(code));
    return ResponseEntity.ok(StationResponse.from(entity));
  }
}
