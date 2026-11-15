/**
 * Semantic color palette with high contrast (WCAG 2.1 AA & AAA compliant).
 * Direction A — "Tờ vé giấy" (ADR-006):
 * Nền giấy ngà ấm (#F6F4EF), chữ mực xanh đen đậm nét (#1A2230),
 * đỏ son cho Giải Đặc biệt (#B91C1C), xanh lá trúng thưởng (#15803D).
 */

export const colors = {
  light: {
    // Brand & Action
    primary: '#1D4ED8', // blue-700
    primaryHover: '#1E40AF',
    primarySubtle: '#EFF4FE',
    primaryTint: '#EFF4FE',
    onPrimary: '#FFFFFF',

    // Backgrounds & Surfaces (Warm Paper Theme)
    background: '#F6F4EF', // warm paper off-white
    surface: '#FFFFFF', // pure paper surface
    surfaceSunken: '#EFEBE3', // sunken wells / inputs
    surfaceSubtle: '#EFEBE3',
    surfaceElevated: '#FFFFFF',

    // Text & Content (Dark Ink)
    textMain: '#1A2230', // dark blue-black ink (> 15:1 contrast)
    textMuted: '#566070', // slate ink (> 5.7:1 contrast)
    textInverse: '#FFFFFF',

    // Borders & Lines
    border: '#E2DDD2', // paper edge / perforation
    borderFocus: '#1D4ED8',

    // Lottery Result States & Specificity
    special: '#B91C1C', // vermilion red (Giải Đặc biệt)
    specialTint: '#FEF2F2',
    specialBg: '#FEF2F2',

    win: '#15803D', // emerald green (trúng thưởng)
    winTint: '#F0FDF4',
    winBg: '#F0FDF4',
    winBorder: '#86EFAC',

    pending: '#B45309', // amber (kỳ quay chờ)
    pendingTint: '#FFFBEB',
    pendingBg: '#FFFBEB',
    pendingBorder: '#FDE68A',

    loss: '#566070', // neutral ink
    lossBg: '#F6F4EF',
    lossBorder: '#E2DDD2',

    error: '#B42318', // alert red
    errorTint: '#FEF3F2',
    errorBg: '#FEF3F2',
  },
  dark: {
    // Brand & Action
    primary: '#7AA2FF',
    primaryHover: '#93B4FF',
    primarySubtle: '#172554',
    primaryTint: '#172554',
    onPrimary: '#0F1217',

    // Backgrounds & Surfaces (Night Charcoal)
    background: '#0F1217',
    surface: '#181C23',
    surfaceSunken: '#12151B',
    surfaceSubtle: '#12151B',
    surfaceElevated: '#222731',

    // Text & Content (Bright Off-White)
    textMain: '#EEF0F3',
    textMuted: '#9AA3B2',
    textInverse: '#0F1217',

    // Borders & Lines
    border: '#2A303A',
    borderFocus: '#7AA2FF',

    // Lottery Result States & Specificity
    special: '#FF7A70',
    specialTint: '#450A0A',
    specialBg: '#450A0A',

    win: '#4ADE80',
    winTint: '#052E16',
    winBg: '#052E16',
    winBorder: '#166534',

    pending: '#FBBF24',
    pendingTint: '#451A03',
    pendingBg: '#451A03',
    pendingBorder: '#78350F',

    loss: '#9AA3B2',
    lossBg: '#12151B',
    lossBorder: '#2A303A',

    error: '#FF8A80',
    errorTint: '#450A0A',
    errorBg: '#450A0A',
  },
} as const;

export type ColorSchemeName = 'light' | 'dark';
export type ThemeColors = Record<keyof typeof colors.light, string>;
