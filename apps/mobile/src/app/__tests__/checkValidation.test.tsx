import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as api from '@/api/draws';
import { haptics } from '@/lib';

jest.mock('@/api/draws');
jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'ValidationTestQueryWrapper';
  return Wrapper;
}

describe('CheckScreen Inline Validation (FR-CHK-07)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      {
        code: 'TPHCM',
        name: 'TP. Hồ Chí Minh',
        region: 'SOUTH',
        drawDays: ['SATURDAY'],
        liveStreamUrl: null,
      },
    ]);
  });

  it('shows inline error message when entering 5 digits and triggers haptic warning', async () => {
    const { getByTestId, queryByTestId, getByText } = await render(
      <CheckScreen />,
      { wrapper: createWrapper() },
    );

    // Initial state: no error message
    expect(queryByTestId('ticket-validation-error')).toBeNull();

    // Type 5 digits
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '12345');

    await waitFor(() => {
      expect(getByTestId('ticket-validation-error')).toBeTruthy();
      expect(getByText('Số vé phải có đủ 6 chữ số (hiện có 5/6)')).toBeTruthy();
    });

    // Verify haptics.warning was called
    expect(haptics.warning).toHaveBeenCalled();
  });

  it('clears inline error message when 6th digit is entered', async () => {
    const { getByTestId, queryByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Enter 5 digits -> error shown
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '12345');
    await waitFor(() => {
      expect(getByTestId('ticket-validation-error')).toBeTruthy();
    });

    // Enter full 6 digits -> error removed
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');
    await waitFor(() => {
      expect(queryByTestId('ticket-validation-error')).toBeNull();
    });
  });
});
