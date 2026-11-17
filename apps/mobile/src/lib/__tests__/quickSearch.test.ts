import { findQuickMatches, quickSearchFeedback } from '../quickSearch';

const draw = {
  stationName: 'Tiền Giang',
  numbers: { SEVENTH: ['301'], FOURTH: ['04512', '77810'], SPECIAL: ['045123'] },
};
const short = (t: string) => ({ SEVENTH: 'G.7', FOURTH: 'G.4', SPECIAL: 'ĐB' })[t] ?? t;

describe('quick search feedback (T11.19)', () => {
  it('needs at least 2 digits', () => {
    expect(findQuickMatches([draw], '1')).toEqual([]);
    expect(quickSearchFeedback([], '1', short)).toBeNull();
  });

  it('says clearly when nothing matches', () => {
    const m = findQuickMatches([draw], '1234');
    expect(quickSearchFeedback(m, '1234', short)).toBe('Không có số nào khớp ‘1234’ trong bảng này');
  });

  it('lists matching prizes by suffix', () => {
    const m = findQuickMatches([draw], '12');
    expect(quickSearchFeedback(m, '12', short)).toBe('Khớp 1 giải: G.4 · 04512');
    const m2 = findQuickMatches([draw], '01');
    expect(quickSearchFeedback(m2, '01', short)).toBe('Khớp 1 giải: G.7 · 301');
  });

  it('can name the station in the all-stations view', () => {
    const m = findQuickMatches([draw], '23');
    expect(quickSearchFeedback(m, '23', short, true)).toBe('Khớp 1 giải: ĐB · 045123 (Tiền Giang)');
  });
});
