import React from 'react';
import type { ReactNode } from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from '../(tabs)/index';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';

jest.mock('@/api/draws');
jest.mock('@/api/check');

// Monday 2026-11-16 at 9h: the session is Sunday 2026-11-15 (T11.08).
jest.mock('@/hooks/useActiveDrawSession', () => ({
  useActiveDrawSession: () => ({
    date: '2026-11-15',
    dayOfWeek: 7,
    stations: [
      { code: 'tien-giang', name: 'Tiền Giang' },
      { code: 'kien-giang', name: 'Kiên Giang' },
      { code: 'da-lat', name: 'Đà Lạt (Lâm Đồng)' },
    ],
  }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Home quick check uses one draw session (T11.08)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Latest draws are from an older day on purpose: they must not drive the date.
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockResolvedValue([
      { stationCode: 'tp-hcm', drawDate: '2026-11-09', numbers: { SPECIAL: ['111111'] } },
    ]);
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '012345',
      stationCode: 'tien-giang',
      drawDate: '2026-11-15',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalAmount: 0,
    });
  });

  it('sends the session date with a station from that same day', async () => {
    const { getByTestId, getByText } = await render(<HomeScreen />, { wrapper: Wrapper });

    expect(getByText('Tiền Giang')).toBeTruthy();
    fireEvent.changeText(getByTestId('home-ticket-input-digit-0'), '012345');
    await waitFor(() =>
      expect(getByTestId('home-quick-check-btn').props.accessibilityState.disabled).toBe(false),
    );
    fireEvent.press(getByTestId('home-quick-check-btn'));

    await waitFor(() =>
      expect(apiCheck.checkTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket: '012345',
          stationCode: 'tien-giang',
          drawDate: '2026-11-15',
        }),
      ),
    );
  });

  it('offers only the session stations (no hard-coded fallback list)', async () => {
    const { queryByText, getByText } = await render(<HomeScreen />, { wrapper: Wrapper });
    expect(getByText('Kiên Giang')).toBeTruthy();
    expect(queryByText('Cà Mau')).toBeNull();
  });
});
