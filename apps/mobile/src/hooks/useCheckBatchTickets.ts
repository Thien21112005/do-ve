import { useMutation } from '@tanstack/react-query';
import { checkBatchTickets } from '../api/check';
import { mapBatchResponseToUi, type UiBatchResult } from '../api/mappers';
import type { BatchCheckRequest } from '../types';

export function useCheckBatchTickets() {
  const mutation = useMutation<UiBatchResult, Error, BatchCheckRequest>({
    mutationFn: async (payload: BatchCheckRequest) => {
      const raw = await checkBatchTickets(payload);
      return mapBatchResponseToUi(raw);
    },
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
