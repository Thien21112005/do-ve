import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';
import { AppProviders } from '../AppProviders';
import { colorScheme } from 'nativewind';
import { updateSettings, resetSettings } from '@/store/settings';

describe('AppProviders & NativeWindThemeSync (T09.47 / T10.05)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettings();
  });

  afterEach(() => {
    resetSettings();
  });

  it('synchronizes NativeWind colorScheme with app settings', async () => {
    render(
      <AppProviders>
        <Text>Child</Text>
      </AppProviders>,
    );

    // Initial default theme is 'system'
    await waitFor(() => {
      expect(colorScheme.set).toHaveBeenCalledWith('system');
    });

    // Updating themeMode drives NativeWind
    await act(async () => {
      updateSettings({ themeMode: 'dark' });
    });

    await waitFor(() => {
      expect(colorScheme.set).toHaveBeenCalledWith('dark');
    });
  });
});
