import React, { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  queryClient,
  setupNetworkAndFocusManagement,
  setupQueryClientPersistence,
} from '@/lib';
import { useSettings } from '@/store/settings';
import { syncNativeWindTheme } from '@/theme/theme';

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
      {children}
    </QueryClientProvider>
  );
}
