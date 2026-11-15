import React from 'react';
import { Alert, AppState } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsScreen from '../settings';
import {
  getSettings,
  updateSettings,
  resetSettings,
  SETTINGS_STORAGE_KEY,
} from '@/store/settings';
import * as reminderNotification from '@/services/reminderNotification';
import { useRouter } from 'expo-router';

describe('SettingsScreen (Cài đặt)', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    resetSettings();
    await AsyncStorage.clear();
  });

  it('renders all sections, theme options, and toggles', async () => {
    const { getByTestId, getByText } = await render(<SettingsScreen />);

    expect(getByTestId('settings-screen')).toBeTruthy();
    expect(getByText('Cài đặt')).toBeTruthy();
    expect(getByTestId('settings-theme-system')).toBeTruthy();
    expect(getByTestId('settings-theme-light')).toBeTruthy();
    expect(getByTestId('settings-theme-dark')).toBeTruthy();
    expect(getByTestId('settings-celebration-switch')).toBeTruthy();
    expect(getByTestId('settings-haptics-switch')).toBeTruthy();
    expect(getByTestId('settings-reminder-switch')).toBeTruthy();
  });

  it('changes theme mode and persists to AsyncStorage immediately', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const darkOption = getByTestId('settings-theme-dark');
    fireEvent.press(darkOption);

    expect(getSettings().themeMode).toBe('dark');

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).themeMode).toBe('dark');
    });
  });

  it('toggles celebration effect and persists to AsyncStorage', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const switchBtn = getByTestId('settings-celebration-switch');
    // Initially enabled
    expect(getSettings().celebrationEnabled).toBe(true);

    fireEvent.press(switchBtn);
    expect(getSettings().celebrationEnabled).toBe(false);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(JSON.parse(stored!).celebrationEnabled).toBe(false);
    });
  });

  it('toggles haptic feedback and persists to AsyncStorage', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const switchBtn = getByTestId('settings-haptics-switch');
    expect(getSettings().hapticsEnabled).toBe(true);

    fireEvent.press(switchBtn);
    expect(getSettings().hapticsEnabled).toBe(false);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(JSON.parse(stored!).hapticsEnabled).toBe(false);
    });
  });

  it('toggles reminder switch when permission is granted and persists to AsyncStorage', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const switchBtn = getByTestId('settings-reminder-switch');
    expect(getSettings().reminderEnabled).toBe(false);

    fireEvent.press(switchBtn);

    await waitFor(() => {
      expect(getSettings().reminderEnabled).toBe(true);
    });

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(JSON.parse(stored!).reminderEnabled).toBe(true);
    });
  });

  it('automatically turns off reminder switch and alerts user if permission is revoked on mount (T09.44)', async () => {
    updateSettings({ reminderEnabled: true });
    expect(getSettings().reminderEnabled).toBe(true);

    jest.spyOn(reminderNotification, 'hasNotificationPermission').mockResolvedValueOnce(false);
    const alertSpy = jest.spyOn(Alert, 'alert');

    await render(<SettingsScreen />);

    await waitFor(() => {
      expect(getSettings().reminderEnabled).toBe(false);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('thông báo'),
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: expect.stringMatching(/Mở Cài đặt|Cài đặt/i) }),
      ]),
    );
  });

  it('checks permission and disables switch when app returns to foreground (T09.44)', async () => {
    updateSettings({ reminderEnabled: true });

    let appStateCallback: ((state: string) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event: any, cb: any) => {
      if (event === 'change') {
        appStateCallback = cb;
      }
      return { remove: jest.fn() } as any;
    });

    jest.spyOn(reminderNotification, 'hasNotificationPermission')
      .mockResolvedValueOnce(true) // Initial mount check
      .mockResolvedValueOnce(false); // When coming back from OS settings

    const alertSpy = jest.spyOn(Alert, 'alert');

    await render(<SettingsScreen />);
    expect(getSettings().reminderEnabled).toBe(true);

    // Simulate coming back to foreground
    await act(async () => {
      appStateCallback?.('active');
    });

    await waitFor(() => {
      expect(getSettings().reminderEnabled).toBe(false);
    });

    expect(alertSpy).toHaveBeenCalled();
  });

  it('navigates back when pressing header back button', async () => {
    const router = useRouter();
    const { getByTestId } = await render(<SettingsScreen />);

    const backBtn = getByTestId('settings-back-btn');
    fireEvent.press(backBtn);

    expect(router.back).toHaveBeenCalled();
  });

  it('prevents double-toggle and duplicate screen reader announcement on switch rows (T09.50)', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const celebrationSwitch = getByTestId('celebration-switch-visual');
    expect(celebrationSwitch.props.accessible).toBe(false);
    expect(celebrationSwitch.props.pointerEvents).toBe('none');
    expect(celebrationSwitch.props.onValueChange).toBeUndefined();

    const hapticsSwitch = getByTestId('haptics-switch-visual');
    expect(hapticsSwitch.props.accessible).toBe(false);
    expect(hapticsSwitch.props.pointerEvents).toBe('none');
    expect(hapticsSwitch.props.onValueChange).toBeUndefined();

    const reminderSwitch = getByTestId('reminder-switch-visual');
    expect(reminderSwitch.props.accessible).toBe(false);
    expect(reminderSwitch.props.pointerEvents).toBe('none');
    expect(reminderSwitch.props.onValueChange).toBeUndefined();
  });
});

