import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useAppFonts,
  useAppConfig,
  usePendingTicketsReminder,
  usePendingTicketsRecheck,
} from '@/hooks';
import { AppProviders, AppVersionGate, ErrorBoundary } from '@/components';
import { initCrashReporting } from '@/services/crashReporting';
import { loadSettings } from '@/store/settings';

initCrashReporting();

// Prevent splash screen from auto hiding before fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore in unsupported environments like SSR or certain test runners
});

function AppContent() {
  const { config, refetch } = useAppConfig();
  usePendingTicketsReminder();
  usePendingTicketsRecheck();

  return (
    <AppVersionGate config={config} onRetry={refetch}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="schedule" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
      </Stack>
    </AppVersionGate>
  );
}

export default function RootLayout() {
  const [loaded, error] = useAppFonts();
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    loadSettings()
      .catch(() => {})
      .finally(() => {
        setSettingsLoaded(true);
      });
  }, []);

  const isReady = (loaded || error) && settingsLoaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  // Keep showing splash screen while font and settings are loading (T09.48)
  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
