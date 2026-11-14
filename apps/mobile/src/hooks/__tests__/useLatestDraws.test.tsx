import React, { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLatestDraws } from '../useLatestDraws';
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

const mockDraws: DrawResultResponse[] = [
  {
    stationCode: 'TPHCM',
    stationName: 'TP. Hồ Chí Minh',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['123456'],
      FIRST: ['65432'],
      EIGHTH: ['67'],
    },
    status: 'FINAL',
  },
  {
    stationCode: 'DONG_THAP',
    stationName: 'Đồng Tháp',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['999999'],
      FIRST: ['88888'],
      EIGHTH: ['11'],
    },
    status: 'FINAL',
  },
];

describe('useLatestDraws hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns latest draws', async () => {
    (apiDraws.fetchLatestDraws as jest.Mock).mockResolvedValue(mockDraws);

    const { result } = await renderHook(() => useLatestDraws(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.draws).toHaveLength(2);
    expect(result.current.draws[0].stationCode).toBe('TPHCM');
    expect(result.current.draws[1].stationCode).toBe('DONG_THAP');
  });

  it('handles query error when fetching fails', async () => {
    (apiDraws.fetchLatestDraws as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = await renderHook(() => useLatestDraws(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.draws).toEqual([]);
  });
});
