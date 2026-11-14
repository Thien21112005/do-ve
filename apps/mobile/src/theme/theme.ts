import { useColorScheme } from 'react-native';
import { colors, type ThemeColors } from './colors';
import { radii, spacing, typography } from './tokens';
import { useSettings } from '@/store/settings';

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  radii: typeof radii;
  spacing: typeof spacing;
  typography: typeof typography;
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
