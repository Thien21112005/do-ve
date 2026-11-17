/**
 * Single source of truth for the Southern lottery draw times (T11.20).
 * No imports, so strings.ts, date.ts and format.ts can all depend on it.
 */
export const DRAW_WINDOW = {
  /** UI treats the session as "live" from here (pre-roll before the draw). */
  liveFrom: '16:10',
  /** Draw starts. */
  start: '16:15',
  /** All stations usually published by now. */
  expectedDone: '16:40',
} as const;

/** "16:40" -> 1000 (minutes after midnight) */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** "16:40" -> "16h40", "16:00" -> "16h" */
export function hourLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export const DRAW_START_LABEL = hourLabel(DRAW_WINDOW.start);
export const DRAW_DONE_LABEL = hourLabel(DRAW_WINDOW.expectedDone);
