import React, { type ReactNode } from 'react';
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
    drawDays: ['SATURDAY', 'MONDAY'],
    liveStreamUrl: null,
  },
];

const mockBatchResponse: BatchCheckResponse = {
  station: 'TPHCM',
  drawDate: '2026-11-14',
  totalPrize: 300000,
  totalWonTickets: 1,
  results: [
    {
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'SEVENTH',
          tierName: 'Giải bảy',
          prizeAmount: 200000,
          matchedDigits: '456',
        },
        {
          tier: 'EIGHTH',
          tierName: 'Giải tám',
          prizeAmount: 100000,
          matchedDigits: '56',
        },
      ],
      totalPrize: 300000,
    },
    {
      ticket: '654321',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalPrize: 0,
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
          station: 'TPHCM',
          tickets: ['123456', '654321'],
        }),
      );
      expect(getByTestId('batch-results-section')).toBeTruthy();
      expect(getByTestId('batch-result-list')).toBeTruthy();
      expect(getByText('300.000 đ')).toBeTruthy();
      expect(getByText('Giải bảy')).toBeTruthy();
    });
  });
});
