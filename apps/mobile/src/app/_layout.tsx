import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts, useAppConfig } from '@/hooks';
import { AppProviders, AppVersionGate } from '@/components';

// Prevent splash screen from auto hiding before fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore in unsupported environments like SSR or certain test runners
});

function AppContent() {
  const { config, refetch } = useAppConfig();

  return (
    <AppVersionGate config={config} onRetry={refetch}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="schedule" options={{ headerShown: false }} />
      </Stack>
    </AppVersionGate>
  );
}

export default function RootLayout() {
  const [loaded, error] = useAppFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  // Keep showing splash screen while font is loading
  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
