import { colors } from '../colors';
import { radii, spacing, typography } from '../tokens';
import { useTheme, syncNativeWindTheme } from '../theme';
import * as ReactNative from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { colorScheme } from 'nativewind';
import { updateSettings, resetSettings } from '@/store/settings';

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
    it('contains expected radii tokens', () => {
      expect(radii.xs).toBe(4);
      expect(radii.sm).toBe(6);
      expect(radii.md).toBe(10);
      expect(radii.lg).toBe(14);
      expect(radii.xl).toBe(20);
      expect(radii.full).toBe(9999);
    });

    it('contains 4px grid spacing scale', () => {
      expect(spacing[1]).toBe(4);
      expect(spacing[2]).toBe(8);
      expect(spacing[4]).toBe(16);
      expect(spacing[8]).toBe(32);
    });

    it('contains font typography tokens', () => {
      expect(typography.fontFamily.sans).toContain('BeVietnamPro');
      expect(typography.fontSize.base).toBe(16);
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
});
