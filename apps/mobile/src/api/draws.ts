import { apiClient } from './client';
import type { StationResponse, DrawResultResponse } from '@/types';

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
): Promise<DrawResultResponse> {
  return apiClient.get<DrawResultResponse>('/api/v1/draws', {
    params: { date, station },
  });
}

export async function fetchLatestDraws(
  station?: string,
): Promise<DrawResultResponse[]> {
  return apiClient.get<DrawResultResponse[]>('/api/v1/draws/latest', {
    params: { station },
  });
}
