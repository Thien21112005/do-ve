import { useQuery } from '@tanstack/react-query';
import { fetchLatestDayDraws, fetchDraw } from '@/api/draws';
import { mapDrawResponseToUi, type UiDrawView } from '@/api/mappers';
import type { StationResponse } from '@/types';

export function useDailyDraws(date: string, stations: StationResponse[] = []) {
  const query = useQuery<UiDrawView[], Error>({
    queryKey: [
      'draws',
      'daily-all',
      date,
      stations.map((s) => s.code).join(','),
    ],
    queryFn: async () => {
      try {
        const latestDayData = await fetchLatestDayDraws(date);
        if (
          latestDayData &&
          Array.isArray(latestDayData) &&
          latestDayData.length > 0
        ) {
          return latestDayData.map((d) => mapDrawResponseToUi(d));
        }
      } catch {
        // Fallback to per-station query
      }

      if (stations.length === 0) return [];
      const results = await Promise.all(
        stations.map(async (st) => {
          try {
            if (!st.code) return null;
            const raw = await fetchDraw(date, st.code);
            const mapped = mapDrawResponseToUi(raw);
            if (!mapped.stationName && st.name) {
              mapped.stationName = st.name;
            }
            return mapped;
          } catch {
            return null;
          }
        }),
      );
      return results.filter(Boolean) as UiDrawView[];
    },
    enabled: Boolean(date),
    staleTime: 1000 * 60 * 15,
  });

  return {
    draws: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
