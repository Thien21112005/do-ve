import { useColorScheme } from 'react-native';
import { colors, type ThemeColors } from './colors';
import { radii, spacing, typography } from './tokens';

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  radii: typeof radii;
  spacing: typeof spacing;
  typography: typeof typography;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: isDark ? colors.dark : colors.light,
    radii,
    spacing,
    typography,
  };
}
