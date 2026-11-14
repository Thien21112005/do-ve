import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDraw } from '../useDraw';
import * as apiDraws from '@/api/draws';
import type { DrawResponse } from '@/types';

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

const mockDrawResult: DrawResponse = {
  stationCode: 'tp-hcm',
  drawDate: '2026-11-14',
  numbers: {
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
};

describe('useDraw hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns draw result for specified date and station', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockResolvedValue(mockDrawResult);

    const { result } = await renderHook(() => useDraw('2026-11-14', 'tp-hcm'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.draw?.stationCode).toBe('tp-hcm');
    expect(result.current.draw?.stationName).toBe('TP. Hồ Chí Minh');
    expect(result.current.draw?.isComplete).toBe(true);
    expect(result.current.draw?.status).toBe('FINAL');
    expect(apiDraws.fetchDraw).toHaveBeenCalledWith('2026-11-14', 'tp-hcm');
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
