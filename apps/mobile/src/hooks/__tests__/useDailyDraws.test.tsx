import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDailyDraws } from '../useDailyDraws';
import * as apiDraws from '@/api/draws';
import { ApiError } from '@/api/client';

jest.mock('@/api/draws');

const DATE = '2026-11-17';
const STATIONS = [
  { code: 'dong-nai', name: 'Đồng Nai' },
  { code: 'can-tho', name: 'Cần Thơ' },
];

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

const networkError = () => new ApiError({ status: 0, code: 'NETWORK_ERROR' });
const drawOf = (stationCode: string) => ({
  stationCode,
  drawDate: DATE,
  numbers: { SPECIAL: ['012345'] },
});

describe('T13.03 useDailyDraws surfaces network errors', () => {
  beforeEach(() => jest.resetAllMocks());

  it('is an error (not an empty day) when every request fails on the network', async () => {
    jest.mocked(apiDraws.fetchLatestDayDraws).mockRejectedValue(networkError());
    jest.mocked(apiDraws.fetchDraw).mockRejectedValue(networkError());

    const { result } = await renderHook(() => useDailyDraws(DATE, STATIONS), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.draws).toEqual([]);
  });

  it('falls back per station and keeps stations that answered', async () => {
    jest.mocked(apiDraws.fetchLatestDayDraws).mockRejectedValue(networkError());
    jest
      .mocked(apiDraws.fetchDraw)
      .mockImplementation(async (_date, station) => {
        if (station === 'can-tho') {
          throw new ApiError({ status: 404, code: 'RESULT_NOT_AVAILABLE' });
        }
        return drawOf(station) as never;
      });

    const { result } = await renderHook(() => useDailyDraws(DATE, STATIONS), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.draws.map((d) => d.stationCode)).toEqual(['dong-nai']);
  });

  it('is an empty day (not an error) when stations simply have no result yet', async () => {
    jest.mocked(apiDraws.fetchLatestDayDraws).mockResolvedValue([]);
    jest
      .mocked(apiDraws.fetchDraw)
      .mockRejectedValue(new ApiError({ status: 404, code: 'RESULT_NOT_AVAILABLE' }));

    const { result } = await renderHook(() => useDailyDraws(DATE, STATIONS), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.draws).toEqual([]);
  });

  it('is an error when one station fails on the network and none answered', async () => {
    jest.mocked(apiDraws.fetchLatestDayDraws).mockResolvedValue([]);
    jest
      .mocked(apiDraws.fetchDraw)
      .mockImplementation(async (_date, station) => {
        if (station === 'can-tho') throw networkError();
        throw new ApiError({ status: 404, code: 'RESULT_NOT_AVAILABLE' });
      });

    const { result } = await renderHook(() => useDailyDraws(DATE, STATIONS), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
