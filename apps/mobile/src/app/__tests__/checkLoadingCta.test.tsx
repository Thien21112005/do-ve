import React from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';
import { colors } from '@/theme/colors';
import { STRINGS } from '@/lib/strings';
import { updateSettings, resetSettings } from '@/store/settings';

jest.mock('@/api/draws');
jest.mock('@/api/check');

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Check CTA loading state (T11.15)', () => {
  beforeEach(() => {
    resetSettings();
    updateSettings({ autoSubmitEnabled: false });
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      { code: 'TPHCM', name: 'TP. Hồ Chí Minh', region: 'SOUTH' },
    ]);
    (apiCheck.checkTicket as jest.Mock).mockReturnValue(new Promise(() => {}));
  });

  it('keeps the primary color, shows a visible spinner and is busy while checking', async () => {
    const { getByTestId, getByText } = await render(<CheckScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(getByTestId('station-chips-TPHCM')).toBeTruthy());
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');
    await waitFor(() =>
      expect(getByTestId('check-ticket-button').props.accessibilityState.disabled).toBe(false),
    );
    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => expect(getByText(STRINGS.check.btnChecking)).toBeTruthy());
    const btn = getByTestId('check-ticket-button');
    const style = StyleSheet.flatten(btn.props.style);
    expect(style.backgroundColor).toBe(colors.light.primary);
    expect(btn.props.accessibilityState).toEqual(expect.objectContaining({ busy: true }));
    expect(getByTestId('check-cta-spinner').props.color).toBe(colors.light.onPrimary);
  });
});
