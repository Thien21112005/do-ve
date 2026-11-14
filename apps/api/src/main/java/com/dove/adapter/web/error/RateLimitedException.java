package com.dove.adapter.web.error;

/** Thrown when request rate limit is exceeded. */
public class RateLimitedException extends BusinessException {

  public RateLimitedException() {
    super(ErrorCode.RATE_LIMITED);
  }

  public RateLimitedException(String message) {
    super(ErrorCode.RATE_LIMITED, message);
  }
}
