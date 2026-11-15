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

  it('does NOT re-trigger celebration/haptics when toggling settings while active remains true (T09.23)', async () => {
    const { rerender } = await render(
      <CelebrationEffect active={true} testID="celebration-overlay" />,
    );
    expect(haptics.success).toHaveBeenCalledTimes(1);

    // Toggle celebrationEnabled off and on while active stays true
    updateSettings({ celebrationEnabled: false });
    await rerender(
      <CelebrationEffect active={true} testID="celebration-overlay" />,
    );

    updateSettings({ celebrationEnabled: true });
    await rerender(
      <CelebrationEffect active={true} testID="celebration-overlay" />,
    );

    // Should still only have been called once, not re-triggered
    expect(haptics.success).toHaveBeenCalledTimes(1);
  });
});
