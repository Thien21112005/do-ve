import { vars } from 'nativewind';
import { colors } from './colors';

/**
 * Converts a palette from colors.ts into NativeWind CSS variables
 * (`textMain` -> `--color-text-main`). colors.ts is the only source of
 * truth; global.css declares no colors (T11.03).
 */
export function toCssVars(palette: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    out[`--color-${kebab}`] = value;
  }
  return out;
}

export const THEME_CSS_VARS = {
  light: vars(toCssVars(colors.light)),
  dark: vars(toCssVars(colors.dark)),
} as const;
