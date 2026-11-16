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

describe('SettingsScreen (Cài đặt)', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    resetSettings();
    await AsyncStorage.clear();
  });

  it('renders all sections, theme options, and toggles', async () => {
    const { getByTestId, getByText } = await render(<SettingsScreen />);

    expect(getByTestId('settings-screen')).toBeTruthy();
    expect(getByText('GIAO DIỆN & HIỂN THỊ')).toBeTruthy();
    expect(getByTestId('settings-theme-segmented')).toBeTruthy();
    expect(getByTestId('settings-theme-system')).toBeTruthy();
    expect(getByTestId('settings-theme-light')).toBeTruthy();
    expect(getByTestId('settings-theme-dark')).toBeTruthy();
    expect(getByTestId('settings-draw-order-segmented')).toBeTruthy();
    expect(getByTestId('settings-autosubmit-switch')).toBeTruthy();
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

  it('toggles auto-submit when 6 digits are typed and persists to AsyncStorage (T10.54)', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const switchBtn = getByTestId('settings-autosubmit-switch');
    expect(getSettings().autoSubmitEnabled).toBe(true);

    fireEvent.press(switchBtn);
    expect(getSettings().autoSubmitEnabled).toBe(false);

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(JSON.parse(stored!).autoSubmitEnabled).toBe(false);
    });
  });

  it('changes drawTableOrder via Segmented control and persists to AsyncStorage (T10.38)', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    expect(getSettings().drawTableOrder).toBe('g8_to_special');
    const specialFirstBtn = getByTestId('settings-draw-order-special-first');
    fireEvent.press(specialFirstBtn);

    expect(getSettings().drawTableOrder).toBe('special_to_g8');

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).drawTableOrder).toBe('special_to_g8');
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

  it('renders native switches with proper a11y role and labels (T10.54)', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const autoSubmitSwitch = getByTestId('settings-autosubmit-switch');
    expect(autoSubmitSwitch.props.accessibilityRole).toBe('switch');
    expect(autoSubmitSwitch.props.accessibilityLabel).toBeTruthy();
    expect(typeof (autoSubmitSwitch.props.onChange || autoSubmitSwitch.props.onValueChange)).toBe('function');

    const celebrationSwitch = getByTestId('settings-celebration-switch');
    expect(celebrationSwitch.props.accessibilityRole).toBe('switch');
    expect(celebrationSwitch.props.accessibilityLabel).toBeTruthy();
    expect(typeof (celebrationSwitch.props.onChange || celebrationSwitch.props.onValueChange)).toBe('function');

    const hapticsSwitch = getByTestId('settings-haptics-switch');
    expect(hapticsSwitch.props.accessibilityRole).toBe('switch');
    expect(hapticsSwitch.props.accessibilityLabel).toBeTruthy();
    expect(typeof (hapticsSwitch.props.onChange || hapticsSwitch.props.onValueChange)).toBe('function');

    const reminderSwitch = getByTestId('settings-reminder-switch');
    expect(reminderSwitch.props.accessibilityRole).toBe('switch');
    expect(reminderSwitch.props.accessibilityLabel).toBeTruthy();
    expect(typeof (reminderSwitch.props.onChange || reminderSwitch.props.onValueChange)).toBe('function');
  });
});

