import { apiClient } from './client';
import type {
  CheckTicketRequest,
  CheckTicketResponse,
  BatchCheckRequest,
  BatchCheckResponse,
} from '@/types';

export async function checkTicket(
  payload: CheckTicketRequest,
): Promise<CheckTicketResponse> {
  return apiClient.post<CheckTicketResponse>('/api/v1/check', payload);
}

export async function checkBatchTickets(
  payload: BatchCheckRequest,
): Promise<BatchCheckResponse> {
  return apiClient.post<BatchCheckResponse>('/api/v1/check/batch', payload);
}
