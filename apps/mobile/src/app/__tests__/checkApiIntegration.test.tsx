import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';
import { ApiError } from '@/api';

jest.mock('@/api/draws');
jest.mock('@/api/check');
jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'CheckApiTestWrapper';
  return Wrapper;
}

describe('CheckScreen API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      {
        code: 'TPHCM',
        name: 'TP. Hồ Chí Minh',
        region: 'SOUTH',
        drawDays: ['SATURDAY'],
        liveStreamUrl: null,
      },
    ]);
  });

  it('renders winning result and formatted prize when ticket wins', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Giải Đặc biệt',
          prizeAmount: 2000000000,
          matchedDigits: '123456',
        },
      ],
      totalPrize: 2000000000,
      message: null,
    });

    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');

    await waitFor(() => {
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false);
    });

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('check-result-section')).toBeTruthy();
      expect(getByText('Chúc mừng bạn đã trúng thưởng!')).toBeTruthy();
      expect(getByText(/Tổng thưởng: 2.000.000.000 đ/)).toBeTruthy();
    });
  });

  it('renders losing result when ticket does not win', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '999999',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalPrize: 0,
      message: null,
    });

    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '999999');

    await waitFor(() => {
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false);
    });

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('check-result-section')).toBeTruthy();
      expect(getByText('Rất tiếc, vé không trúng giải')).toBeTruthy();
    });
  });

  it('renders error banner when API returns error', async () => {
    const apiError = new ApiError({
      status: 422,
      code: 'STATION_NOT_DRAWING',
      detail: 'Đài không mở thưởng vào ngày đã chọn',
    });
    (apiCheck.checkTicket as jest.Mock).mockRejectedValue(apiError);

    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');

    await waitFor(() => {
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false);
    });

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('api-error-banner')).toBeTruthy();
      expect(getByText('Đài không mở thưởng vào ngày đã chọn')).toBeTruthy();
    });
  });
});
