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
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';

initCrashReporting();

// Prevent splash screen from auto hiding before fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore in unsupported environments like SSR or certain test runners
});

function AppContent() {
  const { config, refetch } = useAppConfig();
  const { colors } = useTheme();
  usePendingTicketsReminder();
  usePendingTicketsRecheck();

  return (
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
            headerBackTitle: 'Quay lại',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: STRINGS.settings.screenTitle,
            headerBackTitle: 'Quay lại',
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            headerTitle: STRINGS.about.screenTitle,
            headerBackTitle: 'Quay lại',
          }}
        />
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
