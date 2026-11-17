import { APP_NAME } from '@/lib';
import { THEME_MODES } from '@/theme';
import type { StationCode } from '@/types';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

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

describe('NativeWind build wiring (T11.01)', () => {
  const babelPath = path.resolve(process.cwd(), 'babel.config.js');

  it('has a babel.config.js so className props are compiled', () => {
    expect(fs.existsSync(babelPath)).toBe(true);
  });

  it('sets jsxImportSource to nativewind and includes nativewind/babel', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const factory = require(babelPath);
    const config = factory({ cache: () => undefined });
    const expoPreset = config.presets.find(
      (p: unknown) => Array.isArray(p) && p[0] === 'babel-preset-expo',
    );
    expect(expoPreset?.[1]?.jsxImportSource).toBe('nativewind');
    expect(config.presets).toContain('nativewind/babel');
  });
});
