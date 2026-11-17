import React, { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  PersistQueryClientProvider,
  type Persister,
} from '@tanstack/react-query-persist-client';
import {
  queryClient,
  setupNetworkAndFocusManagement,
  asyncStoragePersister,
  QUERY_CACHE_MAX_AGE,
  QUERY_CACHE_BUSTER,
  shouldDehydrateQuery,
} from '@/lib';
import { useSettings } from '@/store/settings';
import { syncNativeWindTheme, useTheme } from '@/theme/theme';
import { THEME_CSS_VARS } from '@/theme/cssVars';

export interface AppProvidersProps {
  children: ReactNode;
  /** Called once the persisted query cache is restored (or failed to restore). */
  onRestored?: () => void;
  /** Injectable for tests. */
  persister?: Persister;
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

/**
 * PersistQueryClientProvider holds every query until the offline cache is
 * restored, so opening the app offline no longer flashes an error before
 * the cached data appears (T11.23).
 */
export function AppProviders({
  children,
  onRestored,
  persister = asyncStoragePersister,
}: AppProvidersProps) {
  useEffect(() => setupNetworkAndFocusManagement(), []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: QUERY_CACHE_MAX_AGE,
        buster: QUERY_CACHE_BUSTER,
        dehydrateOptions: { shouldDehydrateQuery },
      }}
      onSuccess={onRestored}
      onError={onRestored}
    >
      <NativeWindThemeSync />
      <ThemeVarsRoot>{children}</ThemeVarsRoot>
    </PersistQueryClientProvider>
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
