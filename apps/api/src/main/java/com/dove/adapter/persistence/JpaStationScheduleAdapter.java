package com.dove.adapter.persistence;

import com.dove.application.StationSchedulePort;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

/** JPA adapter implementing the StationSchedulePort using StationScheduleRepository. */
@Component
public class JpaStationScheduleAdapter implements StationSchedulePort {

  private final StationScheduleRepository scheduleRepository;

  public JpaStationScheduleAdapter(StationScheduleRepository scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  @Override
  public List<String> getDrawingStationCodes(LocalDate drawDate) {
    if (drawDate == null) {
      return List.of();
    }
    int weekday = drawDate.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
    return scheduleRepository.findStationsDrawingOn(weekday).stream()
        .map(StationEntity::getCode)
        .toList();
  }
}
