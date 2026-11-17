import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDraw } from '../useDraw';
import * as apiDraws from '@/api/draws';
import { ApiError, API_ERROR_MESSAGES } from '@/api/client';

jest.mock('@/api/draws');

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    // retry ON here: pending states must not be retried
    () => new QueryClient({ defaultOptions: { queries: { retry: 2, retryDelay: 1 } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDraw pending states are not errors (T11.10)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('RESULT_NOT_AVAILABLE → availability NOT_YET, no error, no retry', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockRejectedValue(
      new ApiError({ status: 404, code: 'RESULT_NOT_AVAILABLE' }),
    );
    const { result } = await renderHook(() => useDraw('2026-11-16', 'tp-hcm'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.draw).toBeNull();
    expect(result.current.availability).toBe('NOT_YET');
    expect(apiDraws.fetchDraw).toHaveBeenCalledTimes(1);
  });

  it('STATION_NOT_DRAWING → availability NOT_DRAWING', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockRejectedValue(
      new ApiError({ status: 422, code: 'STATION_NOT_DRAWING' }),
    );
    const { result } = await renderHook(() => useDraw('2026-11-16', 'ben-tre'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.availability).toBe('NOT_DRAWING');
  });

  it('real failures still surface as errors', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL_ERROR' }),
    );
    const { result } = await renderHook(() => useDraw('2026-11-16', 'tp-hcm'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
  });

  it('has a Vietnamese message for RESULT_NOT_AVAILABLE', () => {
    expect(API_ERROR_MESSAGES.RESULT_NOT_AVAILABLE).toBeTruthy();
  });
});
