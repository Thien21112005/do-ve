import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCheckBatchTickets } from '../useCheckBatchTickets';
import * as apiCheck from '@/api/check';
import type { BatchCheckResponse } from '@/types';

jest.mock('@/api/check');

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
  Wrapper.displayName = 'BatchQueryWrapper';
  return Wrapper;
}

const mockBatchResponse: BatchCheckResponse = {
  stationCode: 'tp-hcm',
  drawDate: '2026-11-14',
  totalAmount: 300000,
  results: [
    {
      ticket: '123456',
      stationCode: 'tp-hcm',
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
      stationCode: 'tp-hcm',
      drawDate: '2026-11-14',
      status: 'LOSE',
      won: false,
      wins: [],
      totalAmount: 0,
    },
  ],
};

describe('useCheckBatchTickets hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits batch tickets and receives batch response', async () => {
    (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValue(
      mockBatchResponse,
    );

    const { result } = await renderHook(() => useCheckBatchTickets(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.result).toBeNull();

    await act(async () => {
      result.current.checkBatchTickets({
        stationCode: 'tp-hcm',
        drawDate: '2026-11-14',
        tickets: ['123456', '654321'],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.result?.totalPrize).toBe(300000);
      expect(result.current.result?.totalWonTickets).toBe(1);
    });
  });

  it('handles batch check error', async () => {
    (apiCheck.checkBatchTickets as jest.Mock).mockRejectedValue(
      new Error('API error'),
    );

    const { result } = await renderHook(() => useCheckBatchTickets(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.checkBatchTickets({
        stationCode: 'tp-hcm',
        drawDate: '2026-11-14',
        tickets: ['123456'],
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });
});
