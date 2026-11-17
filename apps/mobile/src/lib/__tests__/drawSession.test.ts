import { getActiveDrawSession } from '../schedule';

// 2026-11-16 is a Monday; 2026-11-15 a Sunday. VN = UTC+7.
const vn = (iso: string) => new Date(`${iso}+07:00`);

describe('getActiveDrawSession (T11.08)', () => {
  it('9h Monday morning → Sunday session with the 3 Sunday stations', () => {
    const s = getActiveDrawSession(vn('2026-11-16T09:00:00'));
    expect(s.date).toBe('2026-11-15');
    expect(s.stations.map((x) => x.code)).toEqual(['tien-giang', 'kien-giang', 'da-lat']);
  });

  it('16h09 is still the previous session', () => {
    expect(getActiveDrawSession(vn('2026-11-16T16:09:00')).date).toBe('2026-11-15');
  });

  it('from 16h10 the session is today with today’s stations', () => {
    const s = getActiveDrawSession(vn('2026-11-16T16:10:00'));
    expect(s.date).toBe('2026-11-16');
    expect(s.stations.map((x) => x.code)).toEqual(['tp-hcm', 'dong-thap', 'ca-mau']);
  });

  it('16h20 → today', () => {
    expect(getActiveDrawSession(vn('2026-11-16T16:20:00')).date).toBe('2026-11-16');
  });

  it('just after midnight → yesterday (the evening session)', () => {
    const s = getActiveDrawSession(vn('2026-11-17T00:30:00'));
    expect(s.date).toBe('2026-11-16');
    expect(s.stations[0].code).toBe('tp-hcm');
  });

  it('date and stations always describe the same weekday', () => {
    for (let h = 0; h < 24; h++) {
      const s = getActiveDrawSession(vn(`2026-11-19T${String(h).padStart(2, '0')}:30:00`));
      const weekday = new Date(`${s.date}T12:00:00Z`).getUTCDay() || 7;
      expect(s.dayOfWeek).toBe(weekday);
    }
  });
});
