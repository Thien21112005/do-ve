import { apiClient } from './client';
import type { AppConfigResponse } from '@/types';

export async function fetchAppConfig(): Promise<AppConfigResponse> {
  return apiClient.get<AppConfigResponse>('/api/v1/app/config');
}

