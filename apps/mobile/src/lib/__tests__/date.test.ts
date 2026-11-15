import {
  todayVN,
  nowVN,
  addDays,
  weekdayVN,
} from '../date';
import { formatDateVN } from '../format';

describe('Vietnam Timezone Date Helpers (T09.15)', () => {
  it('correctly resolves today in Vietnam timezone (Asia/Ho_Chi_Minh)', () => {
    // 2026-11-14 16:59:59 UTC is 23:59:59 VN (still Nov 14 in VN)
    const lateNov14UTC = new Date('2026-11-14T16:59:59Z');
    expect(todayVN(lateNov14UTC)).toBe('2026-11-14');

    // 2026-11-14 17:00:00 UTC is 00:00:00 VN on Nov 15
    const midnightNov15VN = new Date('2026-11-14T17:00:00Z');
    expect(todayVN(midnightNov15VN)).toBe('2026-11-15');

    // 2026-11-14 20:30:00 UTC is 03:30:00 VN on Nov 15 (critical 0h-7h morning window)
    const earlyMorningNov15VN = new Date('2026-11-14T20:30:00Z');
    expect(todayVN(earlyMorningNov15VN)).toBe('2026-11-15');
  });

  it('extracts numerical parts with nowVN', () => {
    const timestamp = new Date('2026-11-14T20:45:12Z'); // 03:45:12 on 2026-11-15 VN
    const vnParts = nowVN(timestamp);

    expect(vnParts.year).toBe(2026);
    expect(vnParts.month).toBe(11);
    expect(vnParts.day).toBe(15);
    expect(vnParts.hour).toBe(3);
    expect(vnParts.minute).toBe(45);
    expect(vnParts.second).toBe(12);
  });

  it('safely adds and subtracts days without timezone drift', () => {
    expect(addDays('2026-11-15', 1)).toBe('2026-11-16');
    expect(addDays('2026-11-15', -1)).toBe('2026-11-14');
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29'); // Leap year
  });

  it('computes ISO weekday (Monday=1, Sunday=7) for Vietnam schedule', () => {
    // 2026-11-15 is Sunday -> 7
    expect(weekdayVN('2026-11-15')).toBe(7);
    // 2026-11-16 is Monday -> 1
    expect(weekdayVN('2026-11-16')).toBe(1);
    // 2026-11-21 is Saturday -> 6
    expect(weekdayVN('2026-11-21')).toBe(6);
  });

  it('formats dates in Vietnamese standard dd/MM/yyyy', () => {
    expect(formatDateVN('2026-11-15')).toBe('15/11/2026');
    expect(formatDateVN('2026-05-02')).toBe('02/05/2026');
  });
});
