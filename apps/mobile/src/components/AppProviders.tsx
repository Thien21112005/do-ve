import React, { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  queryClient,
  setupNetworkAndFocusManagement,
  setupQueryClientPersistence,
} from '@/lib';
import { useSettings } from '@/store/settings';
import { View } from 'react-native';
import { syncNativeWindTheme, useTheme } from '@/theme/theme';
import { THEME_CSS_VARS } from '@/theme/cssVars';

export interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Synchronizes user theme preference with NativeWind colorScheme (T09.47 / T10.05).
 */
export function NativeWindThemeSync() {
  const [settings] = useSettings();

  useEffect(() => {
    syncNativeWindTheme(settings.themeMode);
  }, [settings.themeMode]);

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    const cleanupNetwork = setupNetworkAndFocusManagement();
    const [cleanupPersistence] = setupQueryClientPersistence();
    return () => {
      cleanupNetwork();
      cleanupPersistence();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NativeWindThemeSync />
      <ThemeVarsRoot>{children}</ThemeVarsRoot>
    </QueryClientProvider>
  );
}

/**
 * Provides the --color-* CSS variables for every className below it,
 * generated from colors.ts for the active scheme (T11.03).
 */
export function ThemeVarsRoot({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <View
      testID="theme-vars-root"
      style={[{ flex: 1 }, isDark ? THEME_CSS_VARS.dark : THEME_CSS_VARS.light]}
    >
      {children}
    </View>
  );
}
