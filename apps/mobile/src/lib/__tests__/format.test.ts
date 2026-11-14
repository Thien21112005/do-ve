import { formatCurrency, formatDateVN } from '../format';

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
});
