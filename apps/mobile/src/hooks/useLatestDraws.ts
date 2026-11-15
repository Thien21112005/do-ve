import { useQuery } from '@tanstack/react-query';
import { fetchLatestDraws, fetchLatestDayDraws } from '../api/draws';
import { mapDrawResponseToUi, type UiDrawView } from '../api/mappers';

export function useLatestDraws(station?: string) {
  const query = useQuery<UiDrawView[], Error>({
    queryKey: ['draws', 'latest', station || 'all'],
    queryFn: async () => {
      if (station) {
        const data = await fetchLatestDraws(station);
        if (!data) return [];
        const list = Array.isArray(data) ? data : [data];
        return list.map((d) => mapDrawResponseToUi(d));
      }
      const data = await fetchLatestDayDraws();
      if (!data) return [];
      const list = Array.isArray(data) ? data : [data];
      return list.map((d) => mapDrawResponseToUi(d));
    },
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
