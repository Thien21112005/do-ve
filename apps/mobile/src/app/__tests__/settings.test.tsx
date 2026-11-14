import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsScreen from '../settings';
import {
  getSettings,
  resetSettings,
  SETTINGS_STORAGE_KEY,
} from '@/store/settings';
import { useRouter } from 'expo-router';

describe('SettingsScreen (Cài đặt)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
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

  it('navigates back when pressing header back button', async () => {
    const router = useRouter();
    const { getByTestId } = await render(<SettingsScreen />);

    const backBtn = getByTestId('settings-back-btn');
    fireEvent.press(backBtn);

    expect(router.back).toHaveBeenCalled();
  });
});

