package com.dove.adapter.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "draw_prize_numbers",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_draw_prize_numbers_tier_pos",
          columnNames = {"draw_result_id", "tier", "position"})
    })
public class PrizeNumberEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "draw_result_id", nullable = false)
  private DrawResultEntity drawResult;

  @Column(name = "tier", nullable = false, length = 30)
  private String tier;

  @Column(name = "position", nullable = false)
  private int position;

  @Column(name = "number", nullable = false, length = 6)
  private String number;

  public PrizeNumberEntity() {}

  public PrizeNumberEntity(String tier, int position, String number) {
    this.tier = tier;
    this.position = position;
    this.number = number;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public DrawResultEntity getDrawResult() {
    return drawResult;
  }

  public void setDrawResult(DrawResultEntity drawResult) {
    this.drawResult = drawResult;
  }

  public String getTier() {
    return tier;
  }

  public void setTier(String tier) {
    this.tier = tier;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }

  public String getNumber() {
    return number;
  }

  public void setNumber(String number) {
    this.number = number;
  }
}
