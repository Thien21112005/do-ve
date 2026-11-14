import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLatestDraws } from '../useLatestDraws';
import * as apiDraws from '@/api/draws';

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

const mockDraws = [
  {
    stationCode: 'tp-hcm',
    drawDate: '2026-11-14',
    numbers: {
      SPECIAL: ['123456'],
      FIRST: ['65432'],
      EIGHTH: ['67'],
    },
  },
  {
    stationCode: 'dong-thap',
    drawDate: '2026-11-14',
    numbers: {
      SPECIAL: ['999999'],
      FIRST: ['88888'],
      EIGHTH: ['11'],
    },
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
    expect(result.current.draws[0].stationCode).toBe('tp-hcm');
    expect(result.current.draws[1].stationCode).toBe('dong-thap');
  });

  it('handles single object response from backend without crashing (T09.05)', async () => {
    const singleDraw = {
      stationCode: 'tp-hcm',
      drawDate: '2026-11-02',
      numbers: {
        SPECIAL: ['482915'],
        FIRST: ['73924'],
      },
    };
    (apiDraws.fetchLatestDraws as jest.Mock).mockResolvedValue(singleDraw);

    const { result } = await renderHook(() => useLatestDraws(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.draws).toHaveLength(1);
    expect(result.current.draws[0].stationCode).toBe('tp-hcm');
    expect(result.current.draws[0].stationName).toBe('TP. Hồ Chí Minh');
    expect(result.current.draws[0].numbers.SPECIAL).toEqual(['482915']);
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
