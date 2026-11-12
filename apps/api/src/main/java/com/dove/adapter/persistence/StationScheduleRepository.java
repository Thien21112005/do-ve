package com.dove.adapter.persistence;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StationScheduleRepository extends JpaRepository<StationScheduleEntity, Long> {

  @Query(
      "SELECT s.station FROM StationScheduleEntity s WHERE s.weekday = :weekday ORDER BY"
          + " s.station.name ASC")
  List<StationEntity> findStationsDrawingOn(@Param("weekday") int weekday);

  List<StationScheduleEntity> findByStationCode(String stationCode);
}
