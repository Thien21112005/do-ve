/**
 * Design Tokens for DoVe Mobile Application
 * Based on Emil Kowalski's polish principles and standard 4px/8px grid.
 */

export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const typography = {
  fontFamily: {
    sans: 'BeVietnamPro-Regular',
    regular: 'BeVietnamPro-Regular',
    medium: 'BeVietnamPro-Medium',
    semiBold: 'BeVietnamPro-SemiBold',
    bold: 'BeVietnamPro-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 38,
    '4xl': 44,
  },
} as const;
