import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as api from '@/api/draws';

jest.mock('@/api/draws');

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
  Wrapper.displayName = 'CheckScreenQueryWrapper';
  return Wrapper;
}

describe('CheckScreen Form Composition', () => {
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

  it('renders all sections and disables submit button when ticket is incomplete', async () => {
    const { getByText, getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByText('1. Chọn ngày mở thưởng')).toBeTruthy();
    expect(getByText('2. Chọn đài quay')).toBeTruthy();
    expect(getByText('3. Nhập 6 chữ số trên vé')).toBeTruthy();

    const submitBtn = getByTestId('check-ticket-button');
    expect(submitBtn.props.accessibilityState.disabled).toBe(true);
  });

  it('enables submit button and calls onCheck when ticket is fully filled', async () => {
    const onCheck = jest.fn();
    const { getByTestId } = await render(<CheckScreen onCheck={onCheck} />, {
      wrapper: createWrapper(),
    });

    // Wait for station chips to render
    await waitFor(() => {
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
    });

    // Enter 6 digits in TicketInput
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '987654');

    await waitFor(() => {
      const submitBtn = getByTestId('check-ticket-button');
      expect(submitBtn.props.accessibilityState.disabled).toBe(false);
    });

    const submitBtn = getByTestId('check-ticket-button');
    fireEvent.press(submitBtn);

    expect(onCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        ticket: '987654',
        station: 'TPHCM',
      }),
    );
  });
});
