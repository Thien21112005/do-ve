import { useQuery } from '@tanstack/react-query';
import { fetchDraw } from '@/api';
import { ApiError } from '@/api/client';
import { mapDrawResponseToUi, type UiDrawView } from '@/api/mappers';
import { drawQueryTiming } from '@/lib/drawTiming';

export const DRAW_QUERY_KEY = 'draw' as const;

/**
 * 'AVAILABLE'   – the draw exists (it may still be in progress)
 * 'NOT_YET'     – backend has no result yet (RESULT_NOT_AVAILABLE, 404)
 * 'NOT_DRAWING' – the station does not draw on that date (STATION_NOT_DRAWING)
 * These two are normal states, not errors, and are never retried (T11.10).
 */
export type DrawAvailability = 'AVAILABLE' | 'NOT_YET' | 'NOT_DRAWING';

interface DrawQueryData {
  draw: UiDrawView | null;
  availability: DrawAvailability;
}

/** Nothing more will arrive: the draw is complete, or the station does not draw. */
function isSettled(data?: DrawQueryData): boolean {
  return data?.availability === 'NOT_DRAWING' || Boolean(data?.draw?.isComplete);
}

export function useDraw(date: string, station: string) {
  const query = useQuery<DrawQueryData, Error>({
    queryKey: [DRAW_QUERY_KEY, date, station],
    queryFn: async () => {
      try {
        const raw = await fetchDraw(date, station);
        return raw
          ? { draw: mapDrawResponseToUi(raw), availability: 'AVAILABLE' }
          : { draw: null, availability: 'NOT_YET' };
      } catch (err) {
        if (err instanceof ApiError && err.code === 'RESULT_NOT_AVAILABLE') {
          return { draw: null, availability: 'NOT_YET' };
        }
        if (err instanceof ApiError && err.code === 'STATION_NOT_DRAWING') {
          return { draw: null, availability: 'NOT_DRAWING' };
        }
        throw err;
      }
    },
    enabled: Boolean(date && station),
    // Poll while today's draw is filling in; freeze finished past draws (T11.11)
    staleTime: (q) => drawQueryTiming(date, isSettled(q.state.data)).staleTime,
    refetchInterval: (q) => drawQueryTiming(date, isSettled(q.state.data)).refetchInterval,
  });

  return {
    draw: query.data?.draw ?? null,
    availability: query.data?.availability ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}
