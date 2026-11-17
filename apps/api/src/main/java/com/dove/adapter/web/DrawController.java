package com.dove.adapter.web;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
import com.dove.adapter.persistence.StationScheduleRepository;
import com.dove.adapter.web.dto.DrawResponse;
import com.dove.adapter.web.dto.StationResponse;
import com.dove.adapter.web.error.ResultNotAvailableException;
import com.dove.adapter.web.error.StationNotDrawingException;
import com.dove.adapter.web.error.StationNotFoundException;
import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Controller for lottery draw schedules and draw results endpoints. */
@RestController
@RequestMapping("/api/v1/draws")
@Tag(name = "Draws", description = "Lịch quay thưởng và kết quả xổ số kiến thiết")
public class DrawController {

  private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

  private final StationScheduleRepository stationScheduleRepository;
  private final DrawRepository drawRepository;
  private final StationRepository stationRepository;
  private final Clock clock;

  @Autowired
  public DrawController(
      StationScheduleRepository stationScheduleRepository,
      DrawRepository drawRepository,
      StationRepository stationRepository,
      Optional<Clock> clock) {
    this.stationScheduleRepository =
        Objects.requireNonNull(
            stationScheduleRepository, "stationScheduleRepository must not be null");
    this.drawRepository = Objects.requireNonNull(drawRepository, "drawRepository must not be null");
    this.stationRepository =
        Objects.requireNonNull(stationRepository, "stationRepository must not be null");
    this.clock = clock.orElseGet(() -> Clock.system(VN_ZONE));
  }

  public DrawController(
      StationScheduleRepository stationScheduleRepository,
      DrawRepository drawRepository,
      StationRepository stationRepository) {
    this(stationScheduleRepository, drawRepository, stationRepository, Optional.empty());
  }

  public DrawController(
      StationScheduleRepository stationScheduleRepository,
      DrawRepository drawRepository,
      StationRepository stationRepository,
      Clock clock) {
    this(stationScheduleRepository, drawRepository, stationRepository, Optional.ofNullable(clock));
  }

  @GetMapping("/schedule")
  @Operation(
      summary = "Lịch các đài quay theo ngày",
      description =
          "Trả về danh sách các đài có lịch mở thưởng vào ngày được chỉ định (thứ 2 - chủ nhật)")
  public ResponseEntity<List<StationResponse>> getDrawSchedule(
      @Parameter(description = "Ngày quay (định dạng YYYY-MM-DD)")
          @RequestParam("date")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate date) {
    int weekday = date.getDayOfWeek().getValue();
    List<StationResponse> stations =
        stationScheduleRepository.findStationsDrawingOn(weekday).stream()
            .map(StationResponse::from)
            .toList();
    return ResponseEntity.ok(stations);
  }

  @GetMapping
  @Operation(
      summary = "Kết quả mở thưởng một kỳ quay",
      description =
          "Trả về bảng 18 số mở thưởng của một đài vào ngày cụ thể (có gắn header Cache-Control phù hợp)")
  public ResponseEntity<DrawResponse> getDraw(
      @Parameter(description = "Ngày quay (định dạng YYYY-MM-DD)")
          @RequestParam("date")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate date,
      @Parameter(description = "Mã đài (ví dụ: tp-hcm)") @RequestParam("station") String station,
      org.springframework.web.context.request.WebRequest webRequest) {
    if (stationRepository.findByCode(station).isEmpty()) {
      throw new StationNotFoundException(station);
    }

    int weekday = date.getDayOfWeek().getValue();
    boolean isDrawingOnDate =
        stationScheduleRepository.findStationsDrawingOn(weekday).stream()
            .anyMatch(s -> s.getCode().equalsIgnoreCase(station));
    if (!isDrawingOnDate) {
      throw new StationNotDrawingException(station, date);
    }

    DrawResult drawResult =
        drawRepository
            .findByStationAndDate(station, date)
            .orElseThrow(() -> new ResultNotAvailableException(station, date));

    String etag = generateETag(drawResult);
    if (webRequest != null && webRequest.checkNotModified(etag)) {
      return null;
    }

    LocalDate todayVn = LocalDate.now(clock.withZone(VN_ZONE));
    CacheControl cacheControl;
    if (date.isBefore(todayVn)) {
      // Past draws can be cached for up to 1 day with ETag revalidation (T09.64)
      cacheControl = CacheControl.maxAge(Duration.ofDays(1)).cachePublic();
    } else {
      // Today's draws might be in progress or freshly updated
      cacheControl = CacheControl.noCache();
    }

    String stationName = resolveStationName(station);
    return ResponseEntity.ok()
        .cacheControl(cacheControl)
        .eTag(etag)
        .body(DrawResponse.from(drawResult, stationName));
  }

  private String generateETag(DrawResult draw) {
    StringBuilder sb = new StringBuilder();
    sb.append(draw.stationCode()).append(':').append(draw.drawDate()).append(':');
    draw.numbers()
        .forEach(
            (tier, nums) -> {
              sb.append(tier.name()).append('=').append(String.join(",", nums)).append(';');
            });
    try {
      java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
      byte[] hash = md.digest(sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
      StringBuilder hex = new StringBuilder();
      for (byte b : hash) {
        hex.append(String.format("%02x", b));
      }
      return "\"" + hex + "\"";
    } catch (java.security.NoSuchAlgorithmException e) {
      return "\"" + Integer.toHexString(sb.toString().hashCode()) + "\"";
    }
  }

  @GetMapping("/latest")
  @Operation(
      summary = "Kỳ quay mới nhất",
      description = "Trả về kết quả kỳ quay mới nhất toàn hệ thống hoặc của một đài cụ thể")
  public ResponseEntity<DrawResponse> getLatestDraw(
      @Parameter(description = "Mã đài (tuỳ chọn, nếu bỏ trống lấy kỳ mới nhất toàn hệ thống)")
          @RequestParam(value = "station", required = false)
          String station) {
    Optional<DrawResult> drawResultOpt;
    if (station != null && !station.isBlank()) {
      if (stationRepository.findByCode(station).isEmpty()) {
        throw new StationNotFoundException(station);
      }
      drawResultOpt = drawRepository.findLatestByStation(station);
    } else {
      drawResultOpt = drawRepository.findLatestOverall();
    }

    DrawResult drawResult =
        drawResultOpt.orElseThrow(
            () ->
                new ResultNotAvailableException(
                    station != null
                        ? "Chưa có kết quả cho đài " + station
                        : "Chưa có kết quả nào trong hệ thống"));

    // Latest draw can change dynamically
    CacheControl cacheControl = CacheControl.noCache();
    String stationName = resolveStationName(drawResult.stationCode());
    return ResponseEntity.ok()
        .cacheControl(cacheControl)
        .body(DrawResponse.from(drawResult, stationName));
  }

  @GetMapping("/latest-day")
  @Operation(
      summary = "Kết quả các đài của ngày mở thưởng mới nhất",
      description =
          "Trả về danh sách kết quả mở thưởng của tất cả các đài trong ngày quay gần nhất (hoặc ngày chỉ định nếu có param date)")
  public ResponseEntity<List<DrawResponse>> getLatestDayDraws(
      @Parameter(
              description =
                  "Ngày quay tuỳ chọn (YYYY-MM-DD); nếu bỏ trống lấy ngày mới nhất có kết quả")
          @RequestParam(value = "date", required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate date) {
    List<DrawResult> draws;
    if (date != null) {
      draws = drawRepository.findByDrawDate(date);
    } else {
      draws = drawRepository.findLatestDayDraws();
    }

    LocalDate todayVn = LocalDate.now(clock.withZone(VN_ZONE));
    boolean allPast = draws.stream().allMatch(d -> d.drawDate().isBefore(todayVn));
    CacheControl cacheControl;
    if (draws.isEmpty() || !allPast) {
      cacheControl = CacheControl.noCache();
    } else if (isCompleteDay(draws)) {
      cacheControl = CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable();
    } else {
      // A past day missing a station or numbers may still be backfilled by
      // ingestion: never pin it for a year (T11.12).
      cacheControl = CacheControl.maxAge(Duration.ofSeconds(60));
    }

    List<DrawResponse> responses =
        draws.stream().map(d -> DrawResponse.from(d, resolveStationName(d.stationCode()))).toList();

    return ResponseEntity.ok().cacheControl(cacheControl).body(responses);
  }

  /**
   * A day is complete when every station scheduled for its weekday has a draw and every draw has
   * all 18 numbers.
   */
  private boolean isCompleteDay(List<DrawResult> draws) {
    LocalDate day = draws.getFirst().drawDate();
    int scheduled =
        stationScheduleRepository.findStationsDrawingOn(day.getDayOfWeek().getValue()).size();
    return scheduled > 0
        && draws.size() >= scheduled
        && draws.stream().allMatch(DrawResult::isComplete);
  }

  private String resolveStationName(String stationCode) {
    if (stationRepository != null && stationCode != null) {
      return stationRepository
          .findByCode(stationCode)
          .map(StationEntity::getName)
          .orElse(stationCode);
    }
    return stationCode;
  }
}
