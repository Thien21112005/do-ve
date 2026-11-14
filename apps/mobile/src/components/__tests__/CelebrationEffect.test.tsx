import React from 'react';
import { render } from '@testing-library/react-native';
import { CelebrationEffect } from '../CelebrationEffect';
import { updateSettings, resetSettings } from '@/store';
import { haptics } from '@/lib';

jest.mock('@/lib', () => {
  const actual = jest.requireActual('@/lib');
  return {
    ...actual,
    haptics: {
      ...actual.haptics,
      success: jest.fn(),
    },
  };
});

describe('CelebrationEffect Component', () => {
  beforeEach(() => {
    resetSettings();
    jest.clearAllMocks();
  });

  it('triggers haptics.success and renders celebration overlay when active and enabled', async () => {
    const { getByTestId } = await render(
      <CelebrationEffect active={true} testID="celebration-overlay" />,
    );

    expect(getByTestId('celebration-overlay')).toBeTruthy();
    expect(haptics.success).toHaveBeenCalledTimes(1);
  });

  it('does NOT trigger haptics and does NOT render overlay when celebration is disabled in settings', async () => {
    updateSettings({ celebrationEnabled: false });

    const { queryByTestId } = await render(
      <CelebrationEffect active={true} testID="celebration-overlay" />,
    );

    expect(queryByTestId('celebration-overlay')).toBeNull();
    expect(haptics.success).not.toHaveBeenCalled();
  });

  it('does not render overlay when active is false', async () => {
    const { queryByTestId } = await render(
      <CelebrationEffect active={false} testID="celebration-overlay" />,
    );

    expect(queryByTestId('celebration-overlay')).toBeNull();
    expect(haptics.success).not.toHaveBeenCalled();
  });
});
