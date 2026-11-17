import { colors } from '../colors';
import { toCssVars, THEME_CSS_VARS } from '../cssVars';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const root = process.cwd();

function varsReferencedByTailwind(): string[] {
  const src = fs.readFileSync(path.join(root, 'tailwind.config.js'), 'utf8');
  return Array.from(new Set(src.match(/--color-[a-z-]+/g) ?? []));
}

describe('theme CSS variables (T11.03)', () => {
  it('maps camelCase palette keys to --color-kebab names', () => {
    expect(toCssVars({ textMain: '#000', surfaceSunken: '#111' })).toEqual({
      '--color-text-main': '#000',
      '--color-surface-sunken': '#111',
    });
  });

  it.each(['light', 'dark'] as const)(
    'generates every variable tailwind.config.js references for %s',
    (scheme) => {
      const generated = toCssVars(colors[scheme]);
      for (const name of varsReferencedByTailwind()) {
        expect(generated).toHaveProperty([name]);
      }
    },
  );

  it('uses the exact colors.ts values (no drift)', () => {
    expect(toCssVars(colors.dark)['--color-background']).toBe(colors.dark.background);
    expect(toCssVars(colors.light)['--color-special']).toBe(colors.light.special);
  });

  it('exposes a style object per scheme', () => {
    expect(THEME_CSS_VARS.light).toBeTruthy();
    expect(THEME_CSS_VARS.dark).toBeTruthy();
  });

  it('global.css declares no color values (colors.ts is the single source)', () => {
    const css = fs.readFileSync(path.join(root, 'src/global.css'), 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/--color-/);
  });
});

