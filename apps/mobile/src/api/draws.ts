import { apiClient } from './client';
import type { StationResponse, DrawResponse } from '@/types';

export async function fetchScheduleByDate(
  date: string,
): Promise<StationResponse[]> {
  return apiClient.get<StationResponse[]>('/api/v1/draws/schedule', {
    params: { date },
  });
}

export async function fetchDraw(
  date: string,
  station: string,
): Promise<DrawResponse> {
  return apiClient.get<DrawResponse>('/api/v1/draws', {
    params: { date, station },
  });
}

export async function fetchLatestDraws(
  station?: string,
): Promise<DrawResponse | DrawResponse[]> {
  return apiClient.get<DrawResponse | DrawResponse[]>('/api/v1/draws/latest', {
    params: { station },
  });
}
