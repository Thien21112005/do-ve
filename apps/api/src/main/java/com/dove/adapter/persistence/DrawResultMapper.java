package com.dove.adapter.persistence;

import com.dove.domain.DrawResult;
import com.dove.domain.PrizeTier;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Bi-directional mapper between domain {@link DrawResult} and persistence {@link DrawResultEntity}.
 */
public final class DrawResultMapper {

  private DrawResultMapper() {}

  /**
   * Converts domain {@link DrawResult} to a new {@link DrawResultEntity}.
   *
   * @param domain the domain model
   * @param station the persistent station entity
   * @param source source identifier (e.g. "SCRAPER", "MANUAL")
   * @return entity ready to be persisted
   */
  public static DrawResultEntity toEntity(DrawResult domain, StationEntity station, String source) {
    Objects.requireNonNull(domain, "domain DrawResult không được null");
    Objects.requireNonNull(station, "station entity không được null");

    DrawResultEntity entity =
        new DrawResultEntity(station, domain.drawDate(), source != null ? source : "UNKNOWN");

    domain
        .numbers()
        .forEach(
            (tier, numbers) -> {
              if (tier != null && numbers != null) {
                for (int pos = 0; pos < numbers.size(); pos++) {
                  String num = numbers.get(pos);
                  entity.addPrizeNumber(new PrizeNumberEntity(tier.name(), pos, num));
                }
              }
            });

    return entity;
  }

  /**
   * Cập nhật bản ghi {@link DrawResultEntity} hiện có với dữ liệu mới từ {@link DrawResult}. Tái sử
   * dụng các PrizeNumberEntity hiện có theo tier và position để tránh vi phạm unique constraint,
   * cập nhật source và updated_at.
   */
  public static void updateEntity(DrawResultEntity entity, DrawResult domain, String source) {
    Objects.requireNonNull(entity, "entity DrawResultEntity không được null");
    Objects.requireNonNull(domain, "domain DrawResult không được null");

    entity.setSource(source != null ? source : "UNKNOWN");
    entity.setUpdatedAt(java.time.Instant.now());

    java.util.Map<String, PrizeNumberEntity> existingMap = new java.util.HashMap<>();
    for (PrizeNumberEntity pn : entity.getPrizeNumbers()) {
      existingMap.put(pn.getTier() + ":" + pn.getPosition(), pn);
    }

    java.util.Set<String> processedKeys = new java.util.HashSet<>();

    domain
        .numbers()
        .forEach(
            (tier, numbers) -> {
              if (tier != null && numbers != null) {
                for (int pos = 0; pos < numbers.size(); pos++) {
                  String key = tier.name() + ":" + pos;
                  processedKeys.add(key);
                  String num = numbers.get(pos);
                  PrizeNumberEntity existing = existingMap.get(key);
                  if (existing != null) {
                    existing.setNumber(num);
                  } else {
                    entity.addPrizeNumber(new PrizeNumberEntity(tier.name(), pos, num));
                  }
                }
              }
            });

    entity
        .getPrizeNumbers()
        .removeIf(pn -> !processedKeys.contains(pn.getTier() + ":" + pn.getPosition()));
  }

  /**
   * Converts {@link DrawResultEntity} back into immutable domain {@link DrawResult}.
   *
   * @param entity the persisted entity
   * @return domain model
   */
  public static DrawResult toDomain(DrawResultEntity entity) {
    Objects.requireNonNull(entity, "entity DrawResultEntity không được null");
    Objects.requireNonNull(entity.getStation(), "station trên entity không được null");

    Map<PrizeTier, List<String>> numbersMap = new EnumMap<>(PrizeTier.class);

    List<PrizeNumberEntity> sortedNumbers = new ArrayList<>(entity.getPrizeNumbers());
    sortedNumbers.sort(Comparator.comparingInt(PrizeNumberEntity::getPosition));

    for (PrizeNumberEntity pn : sortedNumbers) {
      PrizeTier tier = PrizeTier.valueOf(pn.getTier());
      numbersMap.computeIfAbsent(tier, k -> new ArrayList<>()).add(pn.getNumber());
    }

    return new DrawResult(entity.getStation().getCode(), entity.getDrawDate(), numbersMap);
  }
}
