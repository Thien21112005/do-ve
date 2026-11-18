import { useQuery } from '@tanstack/react-query';
import { fetchScheduleByDate } from '@/api';
import { weekdayVN, WEEKLY_SCHEDULE } from '@/lib';
import type { StationResponse } from '@/types';

export const SCHEDULE_QUERY_KEY = 'schedule' as const;

export function useSchedule(date: string) {
  const query = useQuery<StationResponse[], Error>({
    queryKey: [SCHEDULE_QUERY_KEY, date],
    queryFn: () => fetchScheduleByDate(date),
    enabled: Boolean(date),
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  const offlineFallback: StationResponse[] =
    !query.data && query.fetchStatus === 'paused' && date
      ? (
          WEEKLY_SCHEDULE.find((d) => d.dayOfWeek === weekdayVN(date))
            ?.stations ?? []
        ).map((s) => ({
          code: s.code,
          name: s.name,
          region: 'SOUTH',
        }))
      : [];

  return {
    stations: query.data ?? offlineFallback,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
