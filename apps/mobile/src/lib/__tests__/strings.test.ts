import { STRINGS } from '../strings';

describe('STRINGS localization dictionary', () => {
  it('contains valid common strings', () => {
    expect(STRINGS.common.appName).toBe('DoVe');
    expect(STRINGS.common.regionName).toBe('MIỀN NAM');
    expect(STRINGS.common.retry).toBe('Thử lại');
  });

  it('contains navigation and tab strings', () => {
    expect(STRINGS.tabs.home).toBe('Trang chủ');
    expect(STRINGS.tabs.check).toBe('Dò vé');
    expect(STRINGS.tabs.results).toBe('Kết quả');
    expect(STRINGS.tabs.tickets).toBe('Vé của tôi');
    expect(STRINGS.tabs.more).toBe('Thêm');
  });

  it('formats check strings with parameters correctly', () => {
    expect(STRINGS.check.validationIncomplete(5)).toBe(
      'Số vé phải có đủ 6 chữ số (hiện có 5/6)',
    );
    expect(STRINGS.check.btnCheckBatch(10)).toBe('Dò hàng loạt (10 vé)');
    expect(STRINGS.check.batchErrorOverLimit(20, 25)).toContain('20');
    expect(STRINGS.check.resultWonCount(3)).toBe('Trúng 3 giải');
  });

  it('contains all 9 prize tiers in results strings', () => {
    expect(STRINGS.results.prizes.special).toBe('Đặc biệt');
    expect(STRINGS.results.prizes.first).toBe('Giải nhất');
    expect(STRINGS.results.prizes.eighth).toBe('Giải tám');
  });

  it('contains schedule and weekdays strings', () => {
    expect(STRINGS.schedule.weekdays.monday).toBe('Thứ Hai');
    expect(STRINGS.schedule.weekdays.sunday).toBe('Chủ Nhật');
    expect(STRINGS.schedule.todayTag).toBe('Hôm nay');
  });

  it('aligns tab and header titles without redundant keys (T10.12)', () => {
    expect(STRINGS.tabs.tickets).toBe('Vé của tôi');
    expect(STRINGS.tickets.screenTitle).toBe('Vé của tôi');
    expect((STRINGS.tickets as Record<string, unknown>).headerTitle).toBeUndefined();

    expect(STRINGS.tabs.more).toBe('Thêm');
    expect(STRINGS.more.screenTitle).toBe('Thêm');

    expect(STRINGS.tabs.results).toBe('Kết quả');
    expect(STRINGS.results.screenTitle).toBe('Kết quả xổ số');

    expect(STRINGS.common.appName).toBe('DoVe');
  });
});
