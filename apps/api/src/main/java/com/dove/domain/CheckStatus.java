package com.dove.domain;

/** High-level status of a ticket verification request. */
public enum CheckStatus {
  /** The draw result was complete and the ticket was thoroughly checked (WON or LOST). */
  CHECKED,

  /**
   * The draw result does not have all 18 numbers yet (e.g. draw is ongoing or not yet ingested).
   * Prevents false "LOST" conclusions when results are pending (BR-06).
   */
  RESULT_NOT_AVAILABLE
}
