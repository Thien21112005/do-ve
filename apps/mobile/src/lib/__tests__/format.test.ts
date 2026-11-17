import {
  formatCurrency,
  formatDateVN,
  getEstimatedDrawTimeMessage,
  animateCountUp,
  formatDrawForShare,
  formatDailyDrawsForShare,
} from '../format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats 0 as 0 đ', () => {
      expect(formatCurrency(0)).toBe('0 đ');
    });

    it('formats hundreds and thousands correctly with dot separator', () => {
      expect(formatCurrency(100)).toBe('100 đ');
      expect(formatCurrency(1000)).toBe('1.000 đ');
      expect(formatCurrency(100000)).toBe('100.000 đ');
      expect(formatCurrency(1234000)).toBe('1.234.000 đ');
    });

    it('formats billions correctly', () => {
      expect(formatCurrency(2000000000)).toBe('2.000.000.000 đ');
    });

    it('handles negative or invalid gracefully', () => {
      expect(formatCurrency(-5000)).toBe('-5.000 đ');
    });
  });

  describe('formatDateVN', () => {
    it('formats YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(formatDateVN('2026-11-14')).toBe('14/11/2026');
      expect(formatDateVN('2026-01-05')).toBe('05/01/2026');
    });

    it('returns original string if format is invalid', () => {
      expect(formatDateVN('invalid')).toBe('invalid');
    });
  });

  describe('getEstimatedDrawTimeMessage (T10.33)', () => {
    it('returns minutes remaining when current time is 16:23 today (17 minutes before 16:40, DRAW_WINDOW)', () => {
      // 16:23 VN = 09:23 UTC
      const mockNow = new Date('2026-11-16T09:23:00.000Z');
      const msg = getEstimatedDrawTimeMessage('2026-11-16', mockNow);
      expect(msg).toBe('Thường có lúc 16h40, còn 17 phút');
    });

    it('returns hours and minutes remaining when early in the morning', () => {
      // 10:00 VN = 03:00 UTC
      const mockNow = new Date('2026-11-16T03:00:00.000Z');
      const msg = getEstimatedDrawTimeMessage('2026-11-16', mockNow);
      expect(msg).toBe('Thường có lúc 16h40, còn khoảng 6h40p');
    });

    it('returns future date format when draw date is tomorrow', () => {
      const mockNow = new Date('2026-11-16T03:00:00.000Z');
      const msg = getEstimatedDrawTimeMessage('2026-11-17', mockNow);
      expect(msg).toBe('Thường có lúc 16h40 ngày 17/11');
    });

    it('returns updating message when draw date is in the past', () => {
      const mockNow = new Date('2026-11-16T03:00:00.000Z');
      const msg = getEstimatedDrawTimeMessage('2026-11-10', mockNow);
      expect(msg).toContain('hệ thống đang cập nhật');
    });
  });

  describe('animateCountUp (T10.37)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('immediately calls onTick and onComplete if target or duration <= 0', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      animateCountUp(0, 600, onTick, onComplete);
      expect(onTick).toHaveBeenCalledWith(0);
      expect(onComplete).toHaveBeenCalledTimes(1);

      const onTick2 = jest.fn();
      const onComplete2 = jest.fn();
      animateCountUp(500000, 0, onTick2, onComplete2);
      expect(onTick2).toHaveBeenCalledWith(500000);
      expect(onComplete2).toHaveBeenCalledTimes(1);
    });

    it('interpolates values progressively over duration and finishes at target', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      animateCountUp(300000, 600, onTick, onComplete);

      // Advance by 300ms (half duration)
      jest.advanceTimersByTime(300);
      expect(onTick).toHaveBeenCalled();
      const intermediateVal = onTick.mock.calls[onTick.mock.calls.length - 1][0];
      expect(intermediateVal).toBeGreaterThan(0);
      expect(intermediateVal).toBeLessThan(300000);

      // Advance past duration
      jest.advanceTimersByTime(350);
      expect(onTick).toHaveBeenLastCalledWith(300000);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('cancels the interval when cleanup function is invoked', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      const cancel = animateCountUp(1000000, 600, onTick, onComplete);
      jest.advanceTimersByTime(90);
      const callCountBefore = onTick.mock.calls.length;

      cancel();
      jest.advanceTimersByTime(600);
      expect(onTick.mock.calls.length).toBe(callCountBefore);
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('formatDrawForShare (T10.43)', () => {
    const mockDraw = {
      stationCode: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      numbers: {
        SPECIAL: ['123456'],
        FIRST: ['65432'],
        SECOND: ['78901'],
        THIRD: ['11223', '44556'],
        FOURTH: ['11111', '22222', '33333', '44444', '55555', '66666', '77777'],
        FIFTH: ['8888'],
        SIXTH: ['999', '111', '222'],
        SEVENTH: ['333'],
        EIGHTH: ['44'],
      },
    };

    it('formats single draw result into clear readable text with special and other tiers', () => {
      const text = formatDrawForShare(mockDraw, '14/11/2026');
      expect(text).toContain('XSMN 14/11/2026 – TP. Hồ Chí Minh');
      expect(text).toContain('ĐB: 123456');
      expect(text).toContain('G.1: 65432');
      expect(text).toContain('G.8: 44');
      expect(text).toContain('G.3: 11223 - 44556');
    });

    it('handles empty or missing draw gracefully', () => {
      expect(formatDrawForShare(null as any)).toBe('');
    });

    it('formats daily draws list for multi-station share', () => {
      const mockDraw2 = {
        stationCode: 'DONG_THAP',
        stationName: 'Đồng Tháp',
        drawDate: '2026-11-14',
        numbers: {
          SPECIAL: ['999999'],
          EIGHTH: ['88'],
        },
      };

      const text = formatDailyDrawsForShare([mockDraw, mockDraw2], '14/11/2026');
      expect(text).toContain('XSMN 14/11/2026');
      expect(text).toContain('TP. Hồ Chí Minh');
      expect(text).toContain('ĐB: 123456');
      expect(text).toContain('Đồng Tháp');
      expect(text).toContain('ĐB: 999999');
    });
  });
});
