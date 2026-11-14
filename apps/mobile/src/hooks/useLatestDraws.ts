import { useQuery } from '@tanstack/react-query';
import { fetchLatestDraws } from '../api/draws';
import type { DrawResultResponse } from '../types';

export function useLatestDraws(station?: string) {
  const query = useQuery<DrawResultResponse[], Error>({
    queryKey: ['draws', 'latest', station || 'all'],
    queryFn: () => fetchLatestDraws(station),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return {
    draws: query.data || [],
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
