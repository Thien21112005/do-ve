import { useMutation } from '@tanstack/react-query';
import { checkTicket } from '@/api';
import { mapCheckResponseToUi, type UiCheckResult } from '@/api/mappers';
import type { CheckTicketRequest } from '@/types';
import type { ApiError } from '@/api';

export function useCheckTicket() {
  const mutation = useMutation<UiCheckResult, ApiError, CheckTicketRequest>({
    mutationFn: async (payload) => {
      const raw = await checkTicket(payload);
      return mapCheckResponseToUi(raw);
    },
  });

  return {
    checkTicket: mutation.mutate,
    checkTicketAsync: mutation.mutateAsync,
    result: mutation.data ?? null,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
