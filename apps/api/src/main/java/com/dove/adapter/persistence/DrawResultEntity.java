package com.dove.adapter.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "draw_results")
public class DrawResultEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "station_id", nullable = false)
  private StationEntity station;

  @Column(name = "draw_date", nullable = false)
  private LocalDate drawDate;

  @Column(name = "source", nullable = false, length = 50)
  private String source;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @OneToMany(mappedBy = "drawResult", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("position ASC")
  private List<PrizeNumberEntity> prizeNumbers = new ArrayList<>();

  public DrawResultEntity() {}

  public DrawResultEntity(StationEntity station, LocalDate drawDate, String source) {
    this.station = station;
    this.drawDate = drawDate;
    this.source = source;
    this.createdAt = Instant.now();
  }

  public void addPrizeNumber(PrizeNumberEntity prizeNumber) {
    prizeNumbers.add(prizeNumber);
    prizeNumber.setDrawResult(this);
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public StationEntity getStation() {
    return station;
  }

  public void setStation(StationEntity station) {
    this.station = station;
  }

  public LocalDate getDrawDate() {
    return drawDate;
  }

  public void setDrawDate(LocalDate drawDate) {
    this.drawDate = drawDate;
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public List<PrizeNumberEntity> getPrizeNumbers() {
    return prizeNumbers;
  }

  public void setPrizeNumbers(List<PrizeNumberEntity> prizeNumbers) {
    this.prizeNumbers = prizeNumbers;
  }
}
