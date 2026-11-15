import { useColorScheme } from 'react-native';
import { colorScheme } from 'nativewind';
import { colors, type ThemeColors } from './colors';
import { radii, spacing, typography } from './tokens';
import { useSettings, type AppSettings } from '@/store/settings';

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  radii: typeof radii;
  spacing: typeof spacing;
  typography: typeof typography;
}

/**
 * Drive NativeWind colorScheme from application themeMode settings (T09.47 / T10.05).
 * Ensures all NativeWind `dark:` utilities respect user preference.
 */
export function syncNativeWindTheme(themeMode: AppSettings['themeMode']): void {
  try {
    colorScheme.set(themeMode);
  } catch {
    // Graceful fallback in environments where NativeWind interop is unavailable
  }
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const [settings] = useSettings();

  const isDark =
    settings.themeMode === 'dark' ||
    (settings.themeMode === 'system' && scheme === 'dark');

  return {
    isDark,
    colors: isDark ? colors.dark : colors.light,
    radii,
    spacing,
    typography,
  };
}
