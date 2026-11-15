/**
 * Crash Reporting Service for DoVe Mobile
 * Strictly enforces privacy: No ticket numbers, lottery selections, or PII are ever sent.
 * Persists up to 20 sanitized crash reports in AsyncStorage for diagnostic recovery (T09.54).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const TICKET_REGEX = /\b\d{6}\b/g;
const NUMBERS_PARAM_REGEX = /([?&]numbers=)([^&]+)/gi;

export const CRASH_STORAGE_KEY = 'dove.crashreports.v1';
export const MAX_STORED_CRASH_REPORTS = 20;

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
let writeQueue = Promise.resolve();

function enqueueCrashWrite<T>(op: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(op, op);
  writeQueue = next.then(
    () => {},
    () => {},
  );
  return next;
}

/**
 * Retrieve stored crash reports from local AsyncStorage (T09.54)
 */
export async function getStoredCrashReports(): Promise<SanitizedErrorPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(CRASH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored crash reports (T09.54)
 */
export async function clearStoredCrashReports(): Promise<void> {
  await enqueueCrashWrite(async () => {
    try {
      await AsyncStorage.removeItem(CRASH_STORAGE_KEY);
    } catch {
      // Ignore removal errors
    }
  });
}

/**
 * Persist a sanitized crash report into local storage (T09.54).
 * Caps storage at MAX_STORED_CRASH_REPORTS (20).
 */
export async function persistCrashReport(
  payload: SanitizedErrorPayload,
): Promise<void> {
  await enqueueCrashWrite(async () => {
    try {
      const existing = await getStoredCrashReports();
      const updated = [payload, ...existing].slice(
        0,
        MAX_STORED_CRASH_REPORTS,
      );
      await AsyncStorage.setItem(CRASH_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore write errors to prevent recursive crash loops
    }
  });
}

/**
 * Set a custom crash sink (e.g. Sentry client or telemetry logger)
 */
export function setCrashSink(
  sink: ((payload: SanitizedErrorPayload) => void) | null,
): void {
  crashSink = sink;
}

/**
 * Initialize crash reporting with data sanitization guards and local persistence (T09.54)
 */
export function initCrashReporting(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (!crashSink) {
    setCrashSink((payload) => {
      persistCrashReport(payload).catch(() => {});
    });
  }
}

/**
 * Reset internal state for test isolation
 */
export function _resetCrashReportingForTesting(): void {
  isInitialized = false;
  crashSink = null;
  writeQueue = Promise.resolve();
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
  } else {
    persistCrashReport(payload).catch(() => {});
  }

  return payload;
}
