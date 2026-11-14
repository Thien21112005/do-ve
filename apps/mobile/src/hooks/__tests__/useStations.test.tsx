import React, { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStations, useStation } from '../useStations';
import * as api from '@/api/stations';
import type { StationResponse } from '@/types';

jest.mock('@/api/stations');

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

const mockStations: StationResponse[] = [
  {
    code: 'TPHCM',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
    drawDays: ['SATURDAY', 'MONDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'DONG_NAI',
    name: 'Đồng Nai',
    region: 'SOUTH',
    drawDays: ['WEDNESDAY'],
    liveStreamUrl: null,
  },
];

describe('useStations hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns station list successfully', async () => {
    (api.fetchStations as jest.Mock).mockResolvedValue(mockStations);

    const { result } = await renderHook(() => useStations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stations).toEqual(mockStations);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('handles station query error gracefully', async () => {
    (api.fetchStations as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = await renderHook(() => useStations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.stations).toEqual([]);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('fetches single station by code', async () => {
    (api.fetchStationByCode as jest.Mock).mockResolvedValue(mockStations[0]);

    const { result } = await renderHook(() => useStation('TPHCM'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.station?.name).toBe('TP. Hồ Chí Minh');
    expect(api.fetchStationByCode).toHaveBeenCalledWith('TPHCM');
  });
});
