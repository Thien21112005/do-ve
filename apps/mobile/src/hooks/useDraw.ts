import { useQuery } from '@tanstack/react-query';
import { fetchDraw } from '@/api';
import { mapDrawResponseToUi, type UiDrawView } from '@/api/mappers';

export const DRAW_QUERY_KEY = 'draw' as const;

export function useDraw(date: string, station: string) {
  const query = useQuery<UiDrawView, Error>({
    queryKey: [DRAW_QUERY_KEY, date, station],
    queryFn: async () => {
      const raw = await fetchDraw(date, station);
      return mapDrawResponseToUi(raw);
    },
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
