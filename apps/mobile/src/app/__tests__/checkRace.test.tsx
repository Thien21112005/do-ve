import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';
import { updateSettings, resetSettings } from '@/store/settings';
import { STRINGS } from '@/lib/strings';

jest.mock('@/api/draws');
jest.mock('@/api/check');

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('CheckScreen ignores stale responses (T11.13)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    resetSettings();
    updateSettings({ autoSubmitEnabled: false });
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      { code: 'TPHCM', name: 'TP. Hồ Chí Minh', region: 'SOUTH' },
      { code: 'DONG_THAP', name: 'Đồng Tháp', region: 'SOUTH' },
    ]);
  });

  it('does not show station A result after switching to station B mid-request', async () => {
    let resolveA: (v: unknown) => void = () => {};
    (apiCheck.checkTicket as jest.Mock).mockReturnValue(
      new Promise((r) => {
        resolveA = r;
      }),
    );

    const { getByTestId, queryByTestId, queryByText } = await render(<CheckScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(getByTestId('station-chips-TPHCM')).toBeTruthy());
    fireEvent.press(getByTestId('station-chips-TPHCM'));
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');
    await waitFor(() =>
      expect(getByTestId('check-ticket-button').props.accessibilityState.disabled).toBe(false),
    );
    fireEvent.press(getByTestId('check-ticket-button'));

    // User changes station while A is in flight
    fireEvent.press(getByTestId('station-chips-DONG_THAP'));

    await act(async () => {
      resolveA({
        ticket: '123456',
        stationCode: 'TPHCM',
        drawDate: '2026-11-15',
        status: 'CHECKED',
        won: false,
        wins: [],
        totalAmount: 0,
      });
    });
    // request settled and re-rendered: the CTA no longer says 'checking'
    await waitFor(() => expect(queryByText(STRINGS.check.btnChecking)).toBeNull());

    expect(queryByTestId('check-result-section')).toBeNull();
  });
});
