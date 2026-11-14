import { APP_NAME } from '@/lib';
import { THEME_MODES } from '@/theme';
import type { StationCode } from '@/types';

describe('Project Structure and Path Aliases', () => {
  it('resolves @/lib alias correctly', () => {
    expect(APP_NAME).toBe('DoVe');
  });

  it('resolves @/theme alias correctly', () => {
    expect(THEME_MODES).toContain('light');
    expect(THEME_MODES).toContain('dark');
  });

  it('resolves @/types alias correctly', () => {
    const station: StationCode = 'TPHCM';
    expect(station).toBe('TPHCM');
  });
});
