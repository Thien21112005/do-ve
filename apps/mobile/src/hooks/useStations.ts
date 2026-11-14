import { useQuery } from '@tanstack/react-query';
import { fetchStations, fetchStationByCode } from '@/api';
import type { StationResponse } from '@/types';

export const STATIONS_QUERY_KEY = 'stations' as const;

export function useStations(region = 'SOUTH') {
  const query = useQuery<StationResponse[], Error>({
    queryKey: [STATIONS_QUERY_KEY, region],
    queryFn: () => fetchStations(region),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - stations rarely change
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in cache
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

export function useStation(code?: string) {
  const query = useQuery<StationResponse, Error>({
    queryKey: [STATIONS_QUERY_KEY, 'detail', code],
    queryFn: () => fetchStationByCode(code!),
    enabled: Boolean(code),
    staleTime: 1000 * 60 * 60 * 24,
  });

  return {
    station: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
