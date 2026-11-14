package com.dove.adapter.web;

import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.adapter.web.dto.StationResponse;
import com.dove.application.DrawRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Controller for lottery draw schedules and draw results endpoints. */
@RestController
@RequestMapping("/api/v1/draws")
public class DrawController {

  private final StationScheduleRepository stationScheduleRepository;
  private final DrawRepository drawRepository;

  public DrawController(
      StationScheduleRepository stationScheduleRepository, DrawRepository drawRepository) {
    this.stationScheduleRepository =
        Objects.requireNonNull(
            stationScheduleRepository, "stationScheduleRepository must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
  }

  @GetMapping("/schedule")
  public ResponseEntity<List<StationResponse>> getDrawSchedule(
      @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    int weekday = date.getDayOfWeek().getValue();
    List<StationResponse> stations =
        stationScheduleRepository.findStationsDrawingOn(weekday).stream()
            .map(StationResponse::from)
            .toList();
    return ResponseEntity.ok(stations);
  }
}
