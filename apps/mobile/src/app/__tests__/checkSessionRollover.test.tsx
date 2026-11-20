import React from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';

jest.mock('@/api/draws');
jest.mock('@/api/check');

// The "latest drawn session" the hook reports; tests move it forward like the clock would.
let mockSessionDate = '2026-11-15';
jest.mock('@/hooks/useActiveDrawSession', () => ({
  useActiveDrawSession: () => ({ date: mockSessionDate, dayOfWeek: 7, stations: [] }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function captureAppStateListener() {
  const listeners: ((s: string) => void)[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((
    _type: string,
    cb: (s: string) => void,
  ) => {
    listeners.push(cb);
    return { remove: jest.fn() };
  }) as never);
  return (state: string) => listeners.forEach((l) => l(state));
}

describe('T13.02 Check tab follows the active draw session', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockSessionDate = '2026-11-15';
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([]);
  });

  it('moves to the new session when the app comes back after 16:10', async () => {
    const emit = captureAppStateListener();
    await render(<CheckScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(apiDraws.fetchScheduleByDate).toHaveBeenCalledWith('2026-11-15'));

    mockSessionDate = '2026-11-16';
    await act(async () => emit('active'));

    await waitFor(() => expect(apiDraws.fetchScheduleByDate).toHaveBeenCalledWith('2026-11-16'));
  });

  it('keeps a date the user picked even after the session changes', async () => {
    const emit = captureAppStateListener();
    const screen = await render(<CheckScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(apiDraws.fetchScheduleByDate).toHaveBeenCalledWith('2026-11-15'));

    fireEvent.press(screen.getByTestId('check-context-picker-btn'));
    fireEvent.press(await screen.findByTestId('sheet-date-2026-11-10'));
    await waitFor(() => expect(apiDraws.fetchScheduleByDate).toHaveBeenCalledWith('2026-11-10'));

    (apiDraws.fetchScheduleByDate as jest.Mock).mockClear();
    mockSessionDate = '2026-11-16';
    await act(async () => emit('active'));

    expect(apiDraws.fetchScheduleByDate).not.toHaveBeenCalledWith('2026-11-16');
  });
});
