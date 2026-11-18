import { colors } from '../colors';
import { radii, spacing, typography, elevations } from '../tokens';
import { useTheme, syncNativeWindTheme } from '../theme';
import * as ReactNative from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { colorScheme } from 'nativewind';
import { updateSettings, resetSettings } from '@/store/settings';

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Helper to calculate relative luminance according to WCAG 2.1
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Design Tokens & Theme', () => {
  describe('WCAG 2.1 AA & AAA Contrast Compliance (Direction A - Tờ vé giấy)', () => {
    it('meets AAA standards (>= 7:1) for light mode main text on surface and background', () => {
      const surfaceRatio = getContrastRatio(
        colors.light.textMain,
        colors.light.surface,
      );
      expect(surfaceRatio).toBeGreaterThanOrEqual(7.0);

      const bgRatio = getContrastRatio(
        colors.light.textMain,
        colors.light.background,
      );
      expect(bgRatio).toBeGreaterThanOrEqual(7.0);
    });

    it('meets AA standards (>= 4.5:1) for light mode muted text on surface and background', () => {
      const surfaceRatio = getContrastRatio(
        colors.light.textMuted,
        colors.light.surface,
      );
      expect(surfaceRatio).toBeGreaterThanOrEqual(4.5);

      const bgRatio = getContrastRatio(
        colors.light.textMuted,
        colors.light.background,
      );
      expect(bgRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA standards (>= 4.5:1) for light mode onPrimary text on primary button', () => {
      const ratio = getContrastRatio(
        colors.light.onPrimary,
        colors.light.primary,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AAA standards (>= 7:1) for dark mode main text on surface and background', () => {
      const surfaceRatio = getContrastRatio(
        colors.dark.textMain,
        colors.dark.surface,
      );
      expect(surfaceRatio).toBeGreaterThanOrEqual(7.0);

      const bgRatio = getContrastRatio(
        colors.dark.textMain,
        colors.dark.background,
      );
      expect(bgRatio).toBeGreaterThanOrEqual(7.0);
    });

    it('meets AA standards (>= 4.5:1) for dark mode muted text on surface and background', () => {
      const surfaceRatio = getContrastRatio(
        colors.dark.textMuted,
        colors.dark.surface,
      );
      expect(surfaceRatio).toBeGreaterThanOrEqual(4.5);

      const bgRatio = getContrastRatio(
        colors.dark.textMuted,
        colors.dark.background,
      );
      expect(bgRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA standards (>= 4.5:1) for dark mode onPrimary text on primary button', () => {
      const ratio = getContrastRatio(
        colors.dark.onPrimary,
        colors.dark.primary,
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA standards for lottery win text contrast', () => {
      const lightWinRatio = getContrastRatio(
        colors.light.win,
        colors.light.surface,
      );
      expect(lightWinRatio).toBeGreaterThanOrEqual(4.5);

      const darkWinRatio = getContrastRatio(
        colors.dark.win,
        colors.dark.surface,
      );
      expect(darkWinRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA standards for special prize (Giải Đặc biệt) text contrast', () => {
      const lightSpecialRatio = getContrastRatio(
        colors.light.special,
        colors.light.surface,
      );
      expect(lightSpecialRatio).toBeGreaterThanOrEqual(4.5);

      const darkSpecialRatio = getContrastRatio(
        colors.dark.special,
        colors.dark.surface,
      );
      expect(darkSpecialRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('includes all required tint and surface tokens for Direction A', () => {
      for (const mode of ['light', 'dark'] as const) {
        expect(colors[mode].surfaceSunken).toBeDefined();
        expect(colors[mode].special).toBeDefined();
        expect(colors[mode].specialTint).toBeDefined();
        expect(colors[mode].winTint).toBeDefined();
        expect(colors[mode].pendingTint).toBeDefined();
        expect(colors[mode].errorTint).toBeDefined();
        expect(colors[mode].onPrimary).toBeDefined();
      }
    });
  });

  describe('Tokens validation', () => {
    it('contains disciplined radii tokens (T10.08)', () => {
      expect(radii.none).toBe(0);
      expect(radii.sm).toBe(8);
      expect(radii.md).toBe(12);
      expect(radii.lg).toBe(16);
      expect(radii.full).toBe(9999);
    });

    it('contains disciplined elevation tokens (T10.08)', () => {
      expect(elevations.none.elevation).toBe(0);
      expect(elevations.sheet.elevation).toBe(8);
      expect(elevations.toast.elevation).toBe(10);
    });

    it('contains 4px grid spacing scale', () => {
      expect(spacing[1]).toBe(4);
      expect(spacing[2]).toBe(8);
      expect(spacing[4]).toBe(16);
      expect(spacing[8]).toBe(32);
    });

    it('contains font typography tokens with Be Vietnam Pro family', () => {
      expect(typography.fontFamily.sans).toBe('BeVietnamPro-Regular');
      expect(typography.fontFamily.regular).toBe('BeVietnamPro-Regular');
      expect(typography.fontFamily.medium).toBe('BeVietnamPro-Medium');
      expect(typography.fontFamily.semiBold).toBe('BeVietnamPro-SemiBold');
      expect(typography.fontFamily.bold).toBe('BeVietnamPro-Bold');
      expect((typography.fontFamily as any).mono).toBeUndefined();
      expect(typography.fontSize.base).toBe(16);
    });

    it('maps Be Vietnam Pro font families without colliding with fontWeight classes (T11.26)', () => {
      const configPath = path.resolve(process.cwd(), 'tailwind.config.js');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const tailwindConfig = require(configPath);
      const fonts = tailwindConfig.theme.extend.fontFamily;
      expect(fonts.sans).toEqual(['BeVietnamPro-Regular']);
      expect(fonts['vn-regular']).toEqual(['BeVietnamPro-Regular']);
      expect(fonts['vn-medium']).toEqual(['BeVietnamPro-Medium']);
      expect(fonts['vn-semibold']).toEqual(['BeVietnamPro-SemiBold']);
      expect(fonts['vn-bold']).toEqual(['BeVietnamPro-Bold']);
      // Must NOT shadow Tailwind's font-medium / font-semibold / font-bold weights
      expect(fonts.medium).toBeUndefined();
      expect(fonts.semibold).toBeUndefined();
      expect(fonts.bold).toBeUndefined();
    });
  });

  describe('useTheme hook', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns light theme when colorScheme is light or null', async () => {
      jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
      const { result } = await renderHook(() => useTheme());
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors.surface).toBe(colors.light.surface);
    });

    it('returns dark theme when colorScheme is dark', async () => {
      jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
      const { result } = await renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.surface).toBe(colors.dark.surface);
    });

    it('forces dark theme when settings.themeMode is dark even if OS is light (T09.47 / T10.05)', async () => {
      jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
      await act(async () => {
        updateSettings({ themeMode: 'dark' });
      });

      const { result } = await renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
      expect(result.current.colors.surface).toBe(colors.dark.surface);

      await act(async () => {
        resetSettings();
      });
    });

    it('forces light theme when settings.themeMode is light even if OS is dark (T09.47 / T10.05)', async () => {
      jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
      await act(async () => {
        updateSettings({ themeMode: 'light' });
      });

      const { result } = await renderHook(() => useTheme());
      expect(result.current.isDark).toBe(false);
      expect(result.current.colors.surface).toBe(colors.light.surface);

      await act(async () => {
        resetSettings();
      });
    });
  });

  describe('NativeWind theme sync (T09.47 / T10.05)', () => {
    afterEach(() => {
      jest.clearAllMocks();
      resetSettings();
    });

    it('calls NativeWind colorScheme.set with themeMode', () => {
      syncNativeWindTheme('dark');
      expect(colorScheme.set).toHaveBeenCalledWith('dark');

      syncNativeWindTheme('light');
      expect(colorScheme.set).toHaveBeenCalledWith('light');

      syncNativeWindTheme('system');
      expect(colorScheme.set).toHaveBeenCalledWith('system');
    });
  });

  describe('Tailwind & NativeWind token mapping (T10.04)', () => {
    it('generates CSS variables for all semantic tokens from colors.ts (T11.03)', () => {
      // global.css .dark block never compiled on native; vars are now
      // generated from colors.ts and applied on the root view.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { toCssVars } = require('../cssVars');
      const light = toCssVars(colors.light);
      const dark = toCssVars(colors.dark);
      expect(light['--color-background']).toBe('#F6F4EF');
      expect(light['--color-text-main']).toBe('#1A2230');
      expect(dark['--color-background']).toBe('#0F1217');
      expect(dark['--color-special']).toBe('#FF7A70');
    });

    it('maps theme tokens to CSS variables in tailwind.config.js', () => {
      const configPath = path.resolve(process.cwd(), 'tailwind.config.js');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const tailwindConfig = require(configPath);
      const themeColors = tailwindConfig.theme.extend.colors;
      expect(themeColors.background).toBe('var(--color-background)');
      expect(themeColors.surface.DEFAULT).toBe('var(--color-surface)');
      expect(themeColors.main).toBe('var(--color-text-main)');
      expect(themeColors.muted).toBe('var(--color-text-muted)');
      expect(themeColors.primary.DEFAULT).toBe('var(--color-primary)');
      expect(themeColors.special.DEFAULT).toBe('var(--color-special)');
      expect(themeColors.win.DEFAULT).toBe('var(--color-win)');
      expect(themeColors.brand).toBeUndefined();
      expect(themeColors.lottery).toBeUndefined();
    });
  });
});
