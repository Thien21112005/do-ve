import { useQuery } from '@tanstack/react-query';
import { fetchScheduleByDate } from '@/api';
import type { StationResponse } from '@/types';

export const SCHEDULE_QUERY_KEY = 'schedule' as const;

export function useSchedule(date: string) {
  const query = useQuery<StationResponse[], Error>({
    queryKey: [SCHEDULE_QUERY_KEY, date],
    queryFn: () => fetchScheduleByDate(date),
    enabled: Boolean(date),
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  return {
    stations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
