package com.dove.adapter.web;

import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.adapter.web.dto.DrawResponse;
import com.dove.adapter.web.dto.StationResponse;
import com.dove.adapter.web.error.StationNotFoundException;
import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller for lottery draw schedules and draw results endpoints. */
@RestController
@RequestMapping("/api/v1/draws")
public class DrawController {

  private final StationScheduleRepository stationScheduleRepository;
  private final DrawRepository drawRepository;
  private final StationRepository stationRepository;

  public DrawController(
      StationScheduleRepository stationScheduleRepository,
      DrawRepository drawRepository,
      StationRepository stationRepository) {
    this.stationScheduleRepository =
        Objects.requireNonNull(
            stationScheduleRepository, "stationScheduleRepository must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.stationRepository =
        Objects.requireNonNull(stationRepository, "stationRepository must not be null");
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

  @GetMapping
  public ResponseEntity<DrawResponse> getDraw(
      @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @RequestParam("station") String station) {
    if (stationRepository.findByCode(station).isEmpty()) {
      throw new StationNotFoundException(station);
    }
    DrawResult drawResult =
        drawRepository
            .findByStationAndDate(station, date)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Chưa có kết quả cho đài " + station + " vào ngày " + date));
    return ResponseEntity.ok(DrawResponse.from(drawResult));
  }
}
