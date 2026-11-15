import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SettingsStore from '@/store/settings';
import * as Hooks from '@/hooks';
import RootLayout from '../_layout';

const mockStatusBar = jest.fn();
jest.mock('expo-status-bar', () => ({
  StatusBar: (props: any) => {
    mockStatusBar(props);
    return null;
  },
}));

jest.mock('@/hooks', () => ({
  useAppFonts: jest.fn(),
  useAppConfig: () => ({ config: null, refetch: jest.fn() }),
  usePendingTicketsReminder: jest.fn(),
  usePendingTicketsRecheck: jest.fn(),
}));

describe('RootLayout - Theme Flash Prevention (T09.48)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    SettingsStore.resetSettings();
  });

  it('keeps splash screen visible until both fonts and settings are loaded', async () => {
    (Hooks.useAppFonts as jest.Mock).mockReturnValue([true, null]);

    let resolveSettingsLoad!: (val: any) => void;
    const pendingSettingsPromise = new Promise((resolve) => {
      resolveSettingsLoad = resolve;
    });

    jest
      .spyOn(SettingsStore, 'loadSettings')
      .mockReturnValue(pendingSettingsPromise as any);

    const rendered = await render(<RootLayout />);

    // While settings are still loading, splash should not hide
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
    expect(rendered.toJSON()).toBeNull();

    // Now resolve settings load
    resolveSettingsLoad({
      celebrationEnabled: true,
      hapticsEnabled: true,
      themeMode: 'dark',
      reminderEnabled: false,
    });

    await waitFor(() => {
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });

  it('renders StatusBar with style matching active theme (T10.14)', async () => {
    (Hooks.useAppFonts as jest.Mock).mockReturnValue([true, null]);
    await SettingsStore.updateSettings({ themeMode: 'dark' });

    await render(<RootLayout />);

    await waitFor(() => {
      expect(mockStatusBar).toHaveBeenCalledWith(
        expect.objectContaining({ style: 'light' }),
      );
    });
  });
});

