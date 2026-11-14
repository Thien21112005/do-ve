package com.dove.adapter.persistence;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<StationEntity, Long> {

  Optional<StationEntity> findByCode(String code);

  List<StationEntity> findByRegion(String region);

  List<StationEntity> findByRegionIgnoreCase(String region);
}
