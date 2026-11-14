import { useQuery } from '@tanstack/react-query';
import { fetchAppConfig } from '../api/config';
import type { AppConfigResponse } from '../types';

export function useAppConfig() {
  const query = useQuery<AppConfigResponse, Error>({
    queryKey: ['app', 'config'],
    queryFn: fetchAppConfig,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    config: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

