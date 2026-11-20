import { useQuery } from '@tanstack/react-query';
import { fetchLatestDayDraws, fetchDraw } from '@/api/draws';
import { mapDrawResponseToUi, type UiDrawView } from '@/api/mappers';
import type { StationResponse } from '@/types';
import { drawQueryTiming } from '@/lib/drawTiming';

/** Backend answers that mean "nothing to show yet", not a failure (matched by code). */
function isExpectedEmpty(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return code === 'RESULT_NOT_AVAILABLE' || code === 'STATION_NOT_DRAWING';
}

function isDayComplete(draws: UiDrawView[] | undefined, stations: StationResponse[]): boolean {
  if (!draws || stations.length === 0) return false;
  return draws.length >= stations.length && draws.every((d) => d.isComplete);
}

export function useDailyDraws(
  date: string,
  stations: StationResponse[] = [],
  enabled = true,
) {
  const query = useQuery<UiDrawView[], Error>({
    queryKey: [
      'draws',
      'daily-all',
      date,
      stations.map((s) => s.code).join(','),
    ],
    queryFn: async () => {
      let firstFailure: unknown = null;
      try {
        const latestDayData = await fetchLatestDayDraws(date);
        if (
          latestDayData &&
          Array.isArray(latestDayData) &&
          latestDayData.length > 0
        ) {
          return latestDayData.map((d) => mapDrawResponseToUi(d));
        }
      } catch (err) {
        // Fallback to per-station query
        if (!isExpectedEmpty(err)) firstFailure = err;
      }

      if (stations.length === 0) {
        if (firstFailure) throw firstFailure;
        return [];
      }
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
          } catch (err) {
            // "No result yet" / "not drawing" are normal; anything else is a real failure.
            if (!isExpectedEmpty(err) && !firstFailure) firstFailure = err;
            return null;
          }
        }),
      );
      const draws = results.filter(Boolean) as UiDrawView[];
      // Nothing came back and something actually failed (network, timeout, 5xx):
      // surface it so the screen shows the error banner with retry, not
      // "no result yet" (T13.03).
      if (draws.length === 0 && firstFailure) throw firstFailure;
      return draws;
    },
    enabled: Boolean(date) && enabled,
    // Poll until every scheduled station is complete (T11.11)
    staleTime: (q) => drawQueryTiming(date, isDayComplete(q.state.data, stations)).staleTime,
    refetchInterval: (q) =>
      drawQueryTiming(date, isDayComplete(q.state.data, stations)).refetchInterval,
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
