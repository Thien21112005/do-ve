import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';

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
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'CheckScreenQueryWrapper';
  return Wrapper;
}

describe('CheckScreen Form Composition', () => {
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

  it('renders all sections and disables submit button when ticket is incomplete', async () => {
    const { getByText, getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByText('1. Chọn ngày mở thưởng')).toBeTruthy();
    expect(getByText('2. Chọn đài quay')).toBeTruthy();
    expect(getByText('3. Nhập 6 chữ số trên vé')).toBeTruthy();

    const submitBtn = getByTestId('check-ticket-button');
    expect(submitBtn.props.accessibilityState.disabled).toBe(true);
  });

  it('enables submit button and calls check API when ticket is fully filled', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '987654',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [],
      totalPrize: 2000000000,
      message: null,
    });

    const onCheckSuccess = jest.fn();
    const { getByTestId } = await render(
      <CheckScreen onCheckSuccess={onCheckSuccess} />,
      { wrapper: createWrapper() },
    );

    // Wait for station chips to render
    await waitFor(() => {
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
    });

    // Enter 6 digits in TicketInput
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '987654');

    await waitFor(() => {
      const submitBtn = getByTestId('check-ticket-button');
      expect(submitBtn.props.accessibilityState.disabled).toBe(false);
    });

    const submitBtn = getByTestId('check-ticket-button');
    fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(apiCheck.checkTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket: '987654',
          station: 'TPHCM',
        }),
      );
      expect(onCheckSuccess).toHaveBeenCalled();
    });
  });
});
