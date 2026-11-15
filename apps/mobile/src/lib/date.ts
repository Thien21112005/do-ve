/**
 * Date and timezone utilities for Vietnam timezone (Asia/Ho_Chi_Minh - GMT+7).
 * Implemented using pure Intl.DateTimeFormat without extra dependencies.
 */

export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns date and time components in Vietnam timezone.
 */
export function nowVN(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => {
    const found = parts.find((p) => p.type === type);
    return found ? parseInt(found.value, 10) : 0;
  };

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
    second: getPart('second'),
  };
}

/**
 * Checks if current Vietnam time is within the live drawing window (16h10 - 16h40).
 */
export function isLiveDrawingVN(date: Date = new Date()): boolean {
  const parts = nowVN(date);
  const minutes = parts.hour * 60 + parts.minute;
  return minutes >= 16 * 60 + 10 && minutes <= 16 * 60 + 40;
}

/**
 * Returns current date string formatted as YYYY-MM-DD in Vietnam timezone.
 */
export function todayVN(date: Date = new Date()): string {
  const parts = nowVN(date);
  const y = parts.year.toString().padStart(4, '0');
  const m = parts.month.toString().padStart(2, '0');
  const d = parts.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Safely adds or subtracts days from a YYYY-MM-DD date string.
 */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Use UTC to avoid local machine timezone daylight savings / offset jumps
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + days);

  const y = utcDate.getUTCFullYear().toString().padStart(4, '0');
  const m = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = utcDate.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns ISO weekday for Vietnam schedule (1 = Monday, ..., 7 = Sunday).
 */
export function weekdayVN(dateInput: string | Date): number {
  let year: number;
  let month: number;
  let day: number;

  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    const parts = nowVN(dateInput);
    year = parts.year;
    month = parts.month;
    day = parts.day;
  }

  // Use UTC midday to prevent any boundary overflow
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}
