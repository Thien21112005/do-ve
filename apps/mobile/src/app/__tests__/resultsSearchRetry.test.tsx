import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResultsScreen from '../(tabs)/results';
import * as apiDraws from '@/api/draws';

jest.mock('@/api/draws');
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOffline: true, isConnected: false }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const tg = {
  stationCode: 'tien-giang',
  stationName: 'Tiền Giang',
  drawDate: '2026-11-15',
  numbers: { SEVENTH: ['301'], FOURTH: ['04512'], SPECIAL: ['045123'] },
};

describe('Results quick search feedback and retry (T11.19)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      { code: 'tien-giang', name: 'Tiền Giang', region: 'SOUTH' },
    ]);
    (apiDraws.fetchDraw as jest.Mock).mockResolvedValue(tg);
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockResolvedValue([tg]);
  });

  it('says when no number matches and lists matches otherwise', async () => {
    const { getByTestId } = await render(<ResultsScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(apiDraws.fetchDraw).toHaveBeenCalled());

    fireEvent.changeText(getByTestId('results-quick-search-input'), '9999');
    await waitFor(() =>
      expect(getByTestId('results-quick-search-feedback').props.children).toBe(
        'Không có số nào khớp ‘9999’ trong bảng này',
      ),
    );

    fireEvent.changeText(getByTestId('results-quick-search-input'), '301');
    await waitFor(() =>
      expect(getByTestId('results-quick-search-feedback').props.children).toBe(
        'Khớp 1 giải: G.7 · 301',
      ),
    );
  });

  it('does not claim "không có số nào khớp" when no draw table is loaded yet', async () => {
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockResolvedValue([]);
    (apiDraws.fetchDraw as jest.Mock).mockRejectedValue(
      Object.assign(new Error('not available'), { code: 'RESULT_NOT_AVAILABLE', status: 404 }),
    );
    const { getByTestId, queryByTestId } = await render(<ResultsScreen />, {
      wrapper: Wrapper,
    });
    await fireEvent.press(getByTestId('results-view-mode-all'));
    await waitFor(() => expect(getByTestId('results-empty-container')).toBeTruthy());

    await fireEvent.changeText(getByTestId('results-quick-search-input'), '9999');
    expect(queryByTestId('results-quick-search-feedback')).toBeNull();
  });

  it('offline retry in "Cả ngày" refetches the whole day, not one station', async () => {
    const { getByTestId } = await render(<ResultsScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(apiDraws.fetchDraw).toHaveBeenCalled());

    fireEvent.press(getByTestId('results-view-mode-all'));
    await waitFor(() => expect(apiDraws.fetchLatestDayDraws).toHaveBeenCalledTimes(1));

    const drawCallsBefore = (apiDraws.fetchDraw as jest.Mock).mock.calls.length;
    fireEvent.press(getByTestId('offline-banner-retry-btn'));
    await waitFor(() => expect(apiDraws.fetchLatestDayDraws).toHaveBeenCalledTimes(2));
    expect(apiDraws.fetchDraw).toHaveBeenCalledTimes(drawCallsBefore);
  });
});
