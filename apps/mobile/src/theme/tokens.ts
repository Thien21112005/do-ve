/**
 * Design Tokens for DoVe Mobile Application
 * Based on Emil Kowalski's polish principles and standard 4px/8px grid.
 */

export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/**
 * Disciplined elevation tokens (T10.08):
 * - Card: flat surface on background, crisp border, NO heavy shadow.
 * - Sheet / Modal / Toast: elevated with subtle shadow.
 */
export const elevations = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  toast: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
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

/**
 * Type scale with 6 standard tiers + dedicated lottery ticket number tiers (T10.07).
 * Minimum size is 12px (WCAG accessible); ticket numbers enforce tabular-nums.
 */
export const typeScale = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'BeVietnamPro-Regular',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'BeVietnamPro-Regular',
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  headline: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'BeVietnamPro-Bold',
  },
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: 'BeVietnamPro-Bold',
  },
  ticketLg: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: 'BeVietnamPro-Bold',
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: 4,
  },
  ticketMd: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'BeVietnamPro-Bold',
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: 2,
  },
} as const;

export type TextVariant = keyof typeof typeScale;

/**
 * Disciplined motion tokens (T10.59):
 * 3 standard durations (120/200/320ms) + 2 standard easings (out-quart & spring).
 * No scattered durations like 250, 300, 350, 800.
 */
export const motion = {
  duration: {
    fast: 120, // Button press, toggle, subtle feedback
    normal: 200, // Segmented control, tabs, chip transitions
    slow: 320, // Card entrance reveal, sheet, modal transition
  },
  easing: {
    outQuart: [0.25, 1, 0.5, 1] as const,
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    },
  },
} as const;

