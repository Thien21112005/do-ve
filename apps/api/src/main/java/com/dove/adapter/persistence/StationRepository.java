package com.dove.adapter.persistence;

import com.dove.application.StationLookupPort;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<StationEntity, Long>, StationLookupPort {

  Optional<StationEntity> findByCode(String code);

  @Override
  default boolean stationExists(String stationCode) {
    return findByCode(stationCode).isPresent();
  }

  List<StationEntity> findByRegion(String region);

  List<StationEntity> findByRegionIgnoreCase(String region);
}
