/**
 * Semantic color palette with high contrast (WCAG 2.1 AA & AAA compliant).
 * Direction A — "Tờ vé giấy" (ADR-006):
 * Nền giấy ngà ấm (#F6F4EF), chữ mực xanh đen đậm nét (#1A2230),
 * đỏ son cho Giải Đặc biệt (#B91C1C), xanh lá trúng thưởng (#15803D).
 */

export const colors = {
  light: {
    // Brand & Action — Deep letterpress ink so vermilion (ĐB/G8) & emerald (win)
    // remain the only two vivid chromatic accents on the paper sheet (T11.29)
    primary: '#1A2230', // deep blue-black ink
    primaryHover: '#0F172A',
    primarySubtle: '#EAE5DB',
    primaryTint: '#EAE5DB',
    onPrimary: '#F6F4EF', // warm ivory paper text (> 14:1 AAA)

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

    // Borders & Lines — Crisp paper edge legible in outdoor sunlight (T11.29)
    border: '#D9D2C3', // paper edge / perforation
    borderFocus: '#1A2230',

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
    lossBorder: '#D9D2C3',

    error: '#B42318', // alert red
    errorTint: '#FEF3F2',
    errorBg: '#FEF3F2',
  },
  dark: {
    // Brand & Action — Warm parchment on night charcoal (T11.29)
    primary: '#EAE5DB',
    primaryHover: '#F6F4EF',
    primarySubtle: '#222834',
    primaryTint: '#222834',
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
    border: '#303744',
    borderFocus: '#EAE5DB',

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
    lossBorder: '#303744',

    error: '#FF8A80',
    errorTint: '#450A0A',
    errorBg: '#450A0A',
  },
} as const;

export type ColorSchemeName = 'light' | 'dark';
export type ThemeColors = Record<keyof typeof colors.light, string>;
