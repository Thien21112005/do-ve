import { useQuery } from '@tanstack/react-query';
import { fetchDraw } from '@/api';
import type { DrawResultResponse } from '@/types';

export const DRAW_QUERY_KEY = 'draw' as const;

export function useDraw(date: string, station: string) {
  const query = useQuery<DrawResultResponse, Error>({
    queryKey: [DRAW_QUERY_KEY, date, station],
    queryFn: () => fetchDraw(date, station),
    enabled: Boolean(date && station),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    draw: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
