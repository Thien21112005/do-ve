import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as Clipboard from 'expo-clipboard';
import type { StationResponse } from '@/types';

jest.mock('@/api/draws');

const mockStations: StationResponse[] = [
  {
    code: 'TPHCM',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
  },
];

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
  Wrapper.displayName = 'BatchTestWrapper';
  return Wrapper;
}

describe('CheckScreen Batch Input (T06.28)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue(mockStations);
  });

  it('switches between single and batch mode', async () => {
    const { getByTestId, queryByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Default mode is single
    expect(getByTestId('mode-single-btn')).toBeTruthy();
    expect(getByTestId('mode-batch-btn')).toBeTruthy();
    expect(queryByTestId('batch-ticket-input')).toBeNull();

    // Switch to batch mode
    fireEvent.press(getByTestId('mode-batch-btn'));

    await waitFor(() => {
      expect(getByTestId('batch-ticket-input')).toBeTruthy();
    });
  });

  it('displays error and disables submit when pasting 25 tickets', async () => {
    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Switch to batch mode
    fireEvent.press(getByTestId('mode-batch-btn'));

    await waitFor(() => {
      expect(getByTestId('batch-ticket-input')).toBeTruthy();
    });

    const input = getByTestId('batch-ticket-input');
    const raw25 = Array.from({ length: 25 }, (_, i) => String(100000 + i)).join(
      ' ',
    );

    fireEvent.changeText(input, raw25);

    await waitFor(() => {
      expect(getByTestId('batch-input-error')).toBeTruthy();
      expect(getByText(/Vượt quá giới hạn tối đa 20 vé/i)).toBeTruthy();
      const submitBtn = getByTestId('check-ticket-button');
      expect(submitBtn.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('enables submit button when valid batch tickets are entered', async () => {
    const { getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Switch to batch mode
    fireEvent.press(getByTestId('mode-batch-btn'));

    await waitFor(() => {
      expect(getByTestId('batch-ticket-input')).toBeTruthy();
    });

    const input = getByTestId('batch-ticket-input');
    fireEvent.changeText(input, '123456\n654321, 012345');

    await waitFor(() => {
      const submitBtn = getByTestId('check-ticket-button');
      expect(submitBtn.props.accessibilityState.disabled).toBe(false);
    });
  });

  it('pastes tickets from device clipboard on native where navigator.clipboard is absent (T11.14)', async () => {
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce('012345\n654321');

    const { getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await fireEvent.press(getByTestId('mode-batch-btn'));
    await waitFor(() => expect(getByTestId('batch-paste-btn')).toBeTruthy());

    await fireEvent.press(getByTestId('batch-paste-btn'));
    await waitFor(() => {
      expect(Clipboard.getStringAsync).toHaveBeenCalledTimes(1);
      expect(getByTestId('batch-ticket-input').props.value).toBe('012345\n654321');
    });

    // Pasting again appends on a new line instead of wiping existing entries
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValueOnce('999888');
    await fireEvent.press(getByTestId('batch-paste-btn'));
    await waitFor(() => {
      expect(getByTestId('batch-ticket-input').props.value).toBe(
        '012345\n654321\n999888',
      );
    });
  });
});
