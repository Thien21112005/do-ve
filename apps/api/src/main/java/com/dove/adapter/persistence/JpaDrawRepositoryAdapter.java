package com.dove.adapter.persistence;

import com.dove.application.DrawRepository;
import com.dove.domain.DrawResult;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class JpaDrawRepositoryAdapter implements DrawRepository {

  private final DrawResultRepository drawResultRepository;
  private final StationRepository stationRepository;

  public JpaDrawRepositoryAdapter(
      DrawResultRepository drawResultRepository, StationRepository stationRepository) {
    this.drawResultRepository = drawResultRepository;
    this.stationRepository = stationRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<DrawResult> findByStationAndDate(String stationCode, LocalDate drawDate) {
    return drawResultRepository
        .findByStationCodeAndDrawDate(stationCode, drawDate)
        .map(DrawResultMapper::toDomain);
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<DrawResult> findLatestByStation(String stationCode) {
    return drawResultRepository
        .findLatestByStationCode(stationCode)
        .map(DrawResultMapper::toDomain);
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<DrawResult> findLatestOverall() {
    return drawResultRepository.findLatestOverall().map(DrawResultMapper::toDomain);
  }

  @Override
  @Transactional
  public DrawResult save(DrawResult drawResult, String source) {
    Objects.requireNonNull(drawResult, "drawResult không được null");
    StationEntity station =
        stationRepository
            .findByCode(drawResult.stationCode())
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Không tìm thấy đài với mã: " + drawResult.stationCode()));

    DrawResultEntity entity = DrawResultMapper.toEntity(drawResult, station, source);
    DrawResultEntity saved = drawResultRepository.save(entity);
    return DrawResultMapper.toDomain(saved);
  }

  @Override
  @Transactional
  public boolean saveIfAbsent(DrawResult drawResult, String source) {
    Objects.requireNonNull(drawResult, "drawResult không được null");
    Optional<DrawResultEntity> existing =
        drawResultRepository.findByStationCodeAndDrawDate(
            drawResult.stationCode(), drawResult.drawDate());
    if (existing.isPresent()) {
      return false;
    }
    save(drawResult, source);
    return true;
  }
}
