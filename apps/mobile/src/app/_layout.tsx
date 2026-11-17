import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';

initCrashReporting();

// Prevent splash screen from auto hiding before fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore in unsupported environments like SSR or certain test runners
});

function AppContent() {
  const { config, refetch } = useAppConfig();
  const { colors, isDark } = useTheme();
  usePendingTicketsReminder();
  usePendingTicketsRecheck();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppVersionGate config={config} onRetry={refetch}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textMain,
          headerTitleStyle: {
            fontFamily: 'BeVietnamPro-SemiBold',
            fontSize: 17,
          },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="schedule"
          options={{
            headerShown: true,
            headerTitle: STRINGS.schedule.screenTitle,
            headerBackTitle: STRINGS.common.back,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: STRINGS.settings.screenTitle,
            headerBackTitle: STRINGS.common.back,
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            headerTitle: STRINGS.about.screenTitle,
            headerBackTitle: STRINGS.common.back,
          }}
        />
      </Stack>
    </AppVersionGate>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useAppFonts();
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // Keep the splash until the offline query cache is restored (T11.23)
  const [cacheRestored, setCacheRestored] = useState(false);

  useEffect(() => {
    loadSettings()
      .catch(() => {})
      .finally(() => {
        setSettingsLoaded(true);
      });
  }, []);

  const isReady = (loaded || error) && settingsLoaded;

  useEffect(() => {
    if (isReady && cacheRestored) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady, cacheRestored]);

  // Keep showing splash screen while font and settings are loading (T09.48)
  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppProviders onRestored={() => setCacheRestored(true)}>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
