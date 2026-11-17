// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
import { TIER_NAMES, TIER_DIGITS, mapCheckResponseToUi } from '../mappers';

/** Tier keys straight from the backend enum, so mobile cannot drift (T11.53). */
function backendTiers(): string[] {
  const file = path.resolve(
    process.cwd(),
    '../api/src/main/java/com/dove/domain/PrizeTier.java',
  );
  const src: string = fs.readFileSync(file, 'utf8');
  return Array.from(src.matchAll(/^\s{2}([A-Z_]+)\(/gm), (m: RegExpMatchArray) => m[1]);
}

describe('prize tier contract with backend PrizeTier (T11.53)', () => {
  it('reads the 11 backend tiers', () => {
    expect(backendTiers()).toContain('ENCOURAGEMENT');
    expect(backendTiers()).toHaveLength(11);
  });

  it('has a Vietnamese name and digit count for every backend tier, and no extras', () => {
    expect(Object.keys(TIER_NAMES).sort()).toEqual(backendTiers().sort());
    expect(Object.keys(TIER_DIGITS).sort()).toEqual(backendTiers().sort());
  });

  it('maps a real ENCOURAGEMENT win to "Giải Khuyến khích" without a misleading 6-digit match', () => {
    const ui = mapCheckResponseToUi({
      ticket: '123457',
      stationCode: 'tp-hcm',
      drawDate: '2026-11-15',
      status: 'CHECKED',
      won: true,
      wins: [{ tier: 'ENCOURAGEMENT', matchedNumber: '123456', prizeAmount: 6000000 }],
      totalAmount: 6000000,
    } as any);
    expect(ui.wins[0].tierName).toBe('Giải Khuyến khích');
    expect(ui.wins[0].matchedDigits).toBe('');
  });

  it('SPECIAL_CONSOLATION highlights the last 5 digits only', () => {
    const ui = mapCheckResponseToUi({
      ticket: '923456',
      stationCode: 'tp-hcm',
      drawDate: '2026-11-15',
      status: 'CHECKED',
      won: true,
      wins: [{ tier: 'SPECIAL_CONSOLATION', matchedNumber: '123456', prizeAmount: 50000000 }],
      totalAmount: 50000000,
    } as any);
    expect(ui.wins[0].tierName).toBe('Giải Phụ Đặc biệt');
    expect(ui.wins[0].matchedDigits).toBe('23456');
  });
});
