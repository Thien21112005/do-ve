import { useMutation } from '@tanstack/react-query';
import { checkTicket } from '@/api';
import type { CheckTicketRequest, CheckTicketResponse } from '@/types';
import type { ApiError } from '@/api';

export function useCheckTicket() {
  const mutation = useMutation<
    CheckTicketResponse,
    ApiError,
    CheckTicketRequest
  >({
    mutationFn: (payload) => checkTicket(payload),
  });

  return {
    checkTicket: mutation.mutate,
    checkTicketAsync: mutation.mutateAsync,
    result: mutation.data,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
