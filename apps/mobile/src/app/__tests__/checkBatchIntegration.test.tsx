import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiCheck from '@/api/check';
import * as apiDraws from '@/api/draws';
import type { StationResponse, BatchCheckResponse } from '@/types';

jest.mock('@/api/check');
jest.mock('@/api/draws');

const mockStations: StationResponse[] = [
  {
    code: 'TPHCM',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
  },
];

const mockBatchResponse: BatchCheckResponse = {
  stationCode: 'TPHCM',
  drawDate: '2026-11-14',
  totalAmount: 300000,
  results: [
    {
      ticket: '123456',
      stationCode: 'TPHCM',
      drawDate: '2026-11-14',
      status: 'WIN',
      won: true,
      wins: [
        {
          tier: 'SEVENTH',
          prizeAmount: 200000,
          matchedNumber: '456',
        },
        {
          tier: 'EIGHTH',
          prizeAmount: 100000,
          matchedNumber: '56',
        },
      ],
      totalAmount: 300000,
    },
    {
      ticket: '654321',
      stationCode: 'TPHCM',
      drawDate: '2026-11-14',
      status: 'LOSE',
      won: false,
      wins: [],
      totalAmount: 0,
    },
  ],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'CheckBatchIntegrationWrapper';
  return Wrapper;
}

describe('CheckScreen Batch Check Flow (T06.29)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue(mockStations);
    (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValue(
      mockBatchResponse,
    );
  });

  it('submits batch tickets and displays batch result list', async () => {
    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Switch to batch mode
    fireEvent.press(getByTestId('mode-batch-btn'));

    await waitFor(() => {
      expect(getByTestId('batch-ticket-input')).toBeTruthy();
    });

    const input = getByTestId('batch-ticket-input');
    fireEvent.changeText(input, '123456\n654321');

    await waitFor(() => {
      const submitBtn = getByTestId('check-ticket-button');
      expect(submitBtn.props.accessibilityState.disabled).toBe(false);
    });

    // Click submit
    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(apiCheck.checkBatchTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          stationCode: 'TPHCM',
          tickets: ['123456', '654321'],
        }),
      );
      expect(getByTestId('batch-results-section')).toBeTruthy();
      expect(getByTestId('batch-result-list')).toBeTruthy();
      expect(getByText('300.000 đ')).toBeTruthy();
      expect(getByText(/Giải Bảy/i)).toBeTruthy();
    });
  });
});
