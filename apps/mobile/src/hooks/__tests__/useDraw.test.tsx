import React, { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDraw } from '../useDraw';
import * as apiDraws from '@/api/draws';
import type { DrawResultResponse } from '@/types';

jest.mock('@/api/draws');

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
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
}

const mockDrawResult: DrawResultResponse = {
  stationCode: 'TPHCM',
  stationName: 'TP. Hồ Chí Minh',
  drawDate: '2026-11-14',
  prizes: {
    SPECIAL: ['123456'],
    FIRST: ['65432'],
    SECOND: ['11223'],
    THIRD: ['33445', '55667'],
    FOURTH: ['11111', '22222', '33333', '44444', '55555', '66666', '77777'],
    FIFTH: ['8888'],
    SIXTH: ['9999', '0000', '1212'],
    SEVENTH: ['345'],
    EIGHTH: ['67'],
  },
  status: 'FINAL',
};

describe('useDraw hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns draw result for specified date and station', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockResolvedValue(mockDrawResult);

    const { result } = await renderHook(() => useDraw('2026-11-14', 'TPHCM'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.draw).toEqual(mockDrawResult);
    expect(result.current.draw?.stationCode).toBe('TPHCM');
    expect(apiDraws.fetchDraw).toHaveBeenCalledWith('2026-11-14', 'TPHCM');
  });

  it('handles query error when draw is not found', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockRejectedValue(
      new Error('Draw not found'),
    );

    const { result } = await renderHook(
      () => useDraw('2026-11-14', 'INVALID'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.draw).toBeNull();
  });
});
