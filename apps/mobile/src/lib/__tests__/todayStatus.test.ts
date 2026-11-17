import { computeTodayStatus } from '../todayStatus';

const draw = (drawDate: string, isComplete: boolean) => ({ drawDate, isComplete });
const TODAY = '2026-11-16';

describe('computeTodayStatus (T11.09)', () => {
  it('morning with yesterday’s results is NOT "final" — it is upcoming', () => {
    const s = computeTodayStatus({
      today: TODAY,
      minutes: 9 * 60,
      isLive: false,
      stationsCount: 3,
      draws: [draw('2026-11-15', true), draw('2026-11-15', true), draw('2026-11-15', true)],
    });
    expect(s.kind).toBe('upcoming');
    expect(s.label).toBe('Chiều nay quay lúc 16h15');
  });

  it('during the draw shows progress per station', () => {
    const s = computeTodayStatus({
      today: TODAY,
      minutes: 16 * 60 + 25,
      isLive: true,
      stationsCount: 3,
      draws: [draw(TODAY, true), draw(TODAY, true), draw(TODAY, false)],
    });
    expect(s.kind).toBe('live');
    expect(s.label).toBe('Đang quay · 2/3 đài có số');
  });

  it('all of today’s stations complete → final', () => {
    const s = computeTodayStatus({
      today: TODAY,
      minutes: 16 * 60 + 50,
      isLive: false,
      stationsCount: 3,
      draws: [draw(TODAY, true), draw(TODAY, true), draw(TODAY, true)],
    });
    expect(s.kind).toBe('final');
    expect(s.label).toBe('Đã có đủ kết quả');
  });

  it('after the window but data missing → still updating, not final', () => {
    const s = computeTodayStatus({
      today: TODAY,
      minutes: 17 * 60,
      isLive: false,
      stationsCount: 3,
      draws: [draw(TODAY, true)],
    });
    expect(s.kind).toBe('live');
    expect(s.label).toBe('Đang cập nhật · 1/3 đài có số');
  });

  it('no schedule today (e.g. Tết) → none', () => {
    const s = computeTodayStatus({
      today: TODAY,
      minutes: 9 * 60,
      isLive: false,
      stationsCount: 0,
      draws: [],
    });
    expect(s.kind).toBe('none');
    expect(s.label).toBe('Hôm nay không có lịch quay');
  });
});
