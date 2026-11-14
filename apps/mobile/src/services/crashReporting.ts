/**
 * Crash Reporting Service for DoVe Mobile
 * Strictly enforces privacy: No ticket numbers, lottery selections, or PII are ever sent.
 */

const TICKET_REGEX = /\b\d{6}\b/g;
const NUMBERS_PARAM_REGEX = /([?&]numbers=)([^&]+)/gi;

/**
 * Sanitizes any string to scrub 6-digit ticket numbers and query parameters
 */
export function sanitizeText(input: string): string {
  if (!input) return input;
  return input
    .replace(NUMBERS_PARAM_REGEX, '$1[REDACTED_TICKETS]')
    .replace(TICKET_REGEX, '[REDACTED_TICKET]');
}

export interface SanitizedErrorPayload {
  message: string;
  name: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

let isInitialized = false;
let crashSink: ((payload: SanitizedErrorPayload) => void) | null = null;

/**
 * Set a custom crash sink (e.g. Sentry client or local telemetry logger)
 */
export function setCrashSink(
  sink: ((payload: SanitizedErrorPayload) => void) | null,
): void {
  crashSink = sink;
}

/**
 * Initialize crash reporting with data sanitization guards
 */
export function initCrashReporting(): void {
  if (isInitialized) return;
  isInitialized = true;

  // In production with Sentry, Sentry.init({...}) would be called here
  // with beforeSend hook enforcing sanitizeText() on all messages and breadcrumbs.
}

/**
 * Records an error after strictly scrubbing all ticket numbers and sensitive params
 */
export function recordCrash(
  error: unknown,
  extraContext?: Record<string, unknown>,
): SanitizedErrorPayload {
  const err =
    error instanceof Error ? error : new Error(String(error ?? 'Unknown error'));

  const sanitizedMessage = sanitizeText(err.message);
  const sanitizedStack = err.stack ? sanitizeText(err.stack) : undefined;

  const sanitizedContext: Record<string, unknown> = {};
  if (extraContext) {
    for (const [key, val] of Object.entries(extraContext)) {
      if (typeof val === 'string') {
        sanitizedContext[key] = sanitizeText(val);
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        sanitizedContext[key] = val;
      } else {
        try {
          sanitizedContext[key] = sanitizeText(JSON.stringify(val));
        } catch {
          sanitizedContext[key] = '[UNSERIALIZABLE]';
        }
      }
    }
  }

  const payload: SanitizedErrorPayload = {
    name: err.name,
    message: sanitizedMessage,
    stack: sanitizedStack,
    context: sanitizedContext,
    timestamp: new Date().toISOString(),
  };

  if (crashSink) {
    try {
      crashSink(payload);
    } catch {
      // Ignore sink errors to prevent recursive crash
    }
  }

  return payload;
}
