import { useMutation } from '@tanstack/react-query';
import { checkBatchTickets } from '../api/check';
import type { BatchCheckRequest, BatchCheckResponse } from '../types';

export function useCheckBatchTickets() {
  const mutation = useMutation<BatchCheckResponse, Error, BatchCheckRequest>({
    mutationFn: (payload: BatchCheckRequest) => checkBatchTickets(payload),
  });

  return {
    checkBatchTickets: mutation.mutate,
    checkBatchTicketsAsync: mutation.mutateAsync,
    result: mutation.data ?? null,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
