import { amountInWordsVN } from '../amountInWords';

describe('amountInWordsVN (T11.21)', () => {
  it.each([
    [0, 'Không đồng'],
    [5, 'Năm đồng'],
    [10, 'Mười đồng'],
    [15, 'Mười lăm đồng'],
    [21, 'Hai mươi mốt đồng'],
    [25, 'Hai mươi lăm đồng'],
    [101, 'Một trăm linh một đồng'],
    [110, 'Một trăm mười đồng'],
    [10_000, 'Mười nghìn đồng'],
    [15_000, 'Mười lăm nghìn đồng'],
    [21_000, 'Hai mươi mốt nghìn đồng'],
    [100_000, 'Một trăm nghìn đồng'],
    [105_000, 'Một trăm linh năm nghìn đồng'],
    [200_000, 'Hai trăm nghìn đồng'],
    [400_000, 'Bốn trăm nghìn đồng'],
    [1_000_005, 'Một triệu không trăm linh năm đồng'],
    [1_005_000, 'Một triệu không trăm linh năm nghìn đồng'],
    [3_000_000, 'Ba triệu đồng'],
    [6_000_000, 'Sáu triệu đồng'],
    [15_000_000, 'Mười lăm triệu đồng'],
    [30_000_000, 'Ba mươi triệu đồng'],
    [50_000_000, 'Năm mươi triệu đồng'],
    [2_000_000_000, 'Hai tỷ đồng'],
    [2_000_300_000, 'Hai tỷ ba trăm nghìn đồng'],
    [2_015_000_000, 'Hai tỷ không trăm mười lăm triệu đồng'],
    [1_000_000_000_000, 'Một nghìn tỷ đồng'],
    [123_456_789, 'Một trăm hai mươi ba triệu bốn trăm năm mươi sáu nghìn bảy trăm tám mươi chín đồng'],
  ])('%d → %s', (n, words) => {
    expect(amountInWordsVN(n)).toBe(words);
  });

  it('rejects negative or non-integer amounts instead of guessing', () => {
    expect(() => amountInWordsVN(-1)).toThrow();
    expect(() => amountInWordsVN(1.5)).toThrow();
  });
});
