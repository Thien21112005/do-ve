import { apiClient } from './client';
import type { StationResponse } from '@/types';

export async function fetchStations(
  region = 'SOUTH',
): Promise<StationResponse[]> {
  return apiClient.get<StationResponse[]>('/api/v1/stations', {
    params: { region },
  });
}

export async function fetchStationByCode(
  code: string,
): Promise<StationResponse> {
  return apiClient.get<StationResponse>(`/api/v1/stations/${code}`);
}
