package com.dove.adapter.web.dto;

import com.dove.domain.Win;

/** DTO for individual winning prize in a ticket check response. */
public record WinResponse(String tier, String matchedNumber, long prizeAmount) {

  public static WinResponse from(Win win) {
    return new WinResponse(win.tier().name(), win.matchedNumber(), win.prizeAmount().vnd());
  }
}
