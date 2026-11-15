package com.dove.adapter.persistence;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DrawResultRepository extends JpaRepository<DrawResultEntity, Long> {

  @Query(
      "SELECT d FROM DrawResultEntity d JOIN FETCH d.station s LEFT JOIN FETCH d.prizeNumbers p"
          + " WHERE s.code = :stationCode AND d.drawDate = :drawDate")
  Optional<DrawResultEntity> findByStationCodeAndDrawDate(
      @Param("stationCode") String stationCode, @Param("drawDate") LocalDate drawDate);

  @Query(
      "SELECT d FROM DrawResultEntity d JOIN FETCH d.station s LEFT JOIN FETCH d.prizeNumbers p"
          + " WHERE s.code = :stationCode ORDER BY d.drawDate DESC LIMIT 1")
  Optional<DrawResultEntity> findLatestByStationCode(@Param("stationCode") String stationCode);

  @Query(
      "SELECT d FROM DrawResultEntity d JOIN FETCH d.station s LEFT JOIN FETCH d.prizeNumbers p"
          + " ORDER BY d.drawDate DESC LIMIT 1")
  Optional<DrawResultEntity> findLatestOverall();

  @Query("SELECT MAX(d.drawDate) FROM DrawResultEntity d")
  Optional<LocalDate> findLatestDrawDate();

  @Query(
      "SELECT DISTINCT d FROM DrawResultEntity d JOIN FETCH d.station s LEFT JOIN FETCH d.prizeNumbers p"
          + " WHERE d.drawDate = :drawDate ORDER BY s.code ASC")
  List<DrawResultEntity> findByDrawDateWithPrizes(@Param("drawDate") LocalDate drawDate);

  List<DrawResultEntity> findByDrawDate(LocalDate drawDate);
}
