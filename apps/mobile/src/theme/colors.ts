/**
 * Semantic color palette with high contrast (WCAG 2.1 AA compliant)
 * Designed for Southern Vietnam Lottery checking experience (DoVe).
 */

export const colors = {
  light: {
    // Brand & Primary
    primary: '#2563eb', // blue-600
    primaryHover: '#1d4ed8', // blue-700
    primarySubtle: '#eff6ff', // blue-50

    // Backgrounds & Surfaces
    background: '#f8fafc', // slate-50
    surface: '#ffffff', // pure white
    surfaceSubtle: '#f1f5f9', // slate-100
    surfaceElevated: '#ffffff',

    // Text & Content
    textMain: '#0f172a', // slate-900 (contrast > 18:1 on white)
    textMuted: '#475569', // slate-600 (contrast ~ 5.9:1 on white)
    textInverse: '#ffffff',

    // Borders & Dividers
    border: '#e2e8f0', // slate-200
    borderFocus: '#2563eb', // blue-600

    // Lottery Result States
    win: '#15803d', // green-700 (contrast ~ 4.9:1 on white)
    winBg: '#f0fdf4', // green-50
    winBorder: '#86efac', // green-300

    loss: '#475569', // slate-600
    lossBg: '#f8fafc', // slate-50
    lossBorder: '#cbd5e1', // slate-300

    pending: '#b45309', // amber-700
    pendingBg: '#fffbeb', // amber-50
    pendingBorder: '#fde68a', // amber-200

    error: '#b91c1c', // red-700
    errorBg: '#fef2f2', // red-50
  },
  dark: {
    // Brand & Primary
    primary: '#3b82f6', // blue-500
    primaryHover: '#60a5fa', // blue-400
    primarySubtle: '#172554', // blue-950

    // Backgrounds & Surfaces
    background: '#090d16', // deeper slate
    surface: '#0f172a', // slate-900
    surfaceSubtle: '#1e293b', // slate-800
    surfaceElevated: '#1e293b', // slate-800

    // Text & Content
    textMain: '#f8fafc', // slate-50 (contrast > 18:1 on slate-900)
    textMuted: '#94a3b8', // slate-400 (contrast ~ 6.1:1 on slate-900)
    textInverse: '#0f172a',

    // Borders & Dividers
    border: '#334155', // slate-700
    borderFocus: '#60a5fa', // blue-400

    // Lottery Result States
    win: '#4ade80', // green-400 (contrast ~ 8.5:1 on slate-900)
    winBg: '#052e16', // green-950
    winBorder: '#166534', // green-800

    loss: '#94a3b8', // slate-400
    lossBg: '#1e293b', // slate-800
    lossBorder: '#334155', // slate-700

    pending: '#fbbf24', // amber-400
    pendingBg: '#451a03', // amber-950
    pendingBorder: '#78350f', // amber-900

    error: '#f87171', // red-400
    errorBg: '#450a0a', // red-950
  },
} as const;

export type ColorSchemeName = 'light' | 'dark';
export type ThemeColors = Record<keyof typeof colors.light, string>;
