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

  it('does NOT fire single-station fetchDraw with stale station when stepping dates in "Cả ngày" mode (T12.07)', async () => {
    (apiDraws.fetchScheduleByDate as jest.Mock).mockImplementation((date: string) => {
      if (date.endsWith('-16')) {
        return Promise.resolve([{ code: 'tp-hcm', name: 'TP. Hồ Chí Minh', region: 'SOUTH' }]);
      }
      return Promise.resolve([{ code: 'ben-tre', name: 'Bến Tre', region: 'SOUTH' }]);
    });

    const { getByTestId } = await render(<ResultsScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(apiDraws.fetchDraw).toHaveBeenCalled());

    // Switch to "Cả ngày"
    fireEvent.press(getByTestId('results-view-mode-all'));
    await waitFor(() => expect(apiDraws.fetchLatestDayDraws).toHaveBeenCalledTimes(1));

    (apiDraws.fetchDraw as jest.Mock).mockClear();

    // Step to previous date while in "Cả ngày" mode
    fireEvent.press(getByTestId('results-prev-date-btn'));
    await waitFor(() => expect(apiDraws.fetchLatestDayDraws).toHaveBeenCalledTimes(2));

    // Must NOT call single-station fetchDraw while viewing "Cả ngày"
    expect(apiDraws.fetchDraw).not.toHaveBeenCalled();

    // Switching back to "Từng đài" queries the new date's station, never the stale station
    fireEvent.press(getByTestId('results-view-mode-single'));
    await waitFor(() => expect(apiDraws.fetchDraw).toHaveBeenCalledTimes(1));
  });

  it('Review I2: does NOT fire stale-station fetchDraw while schedule is loading when stepping dates in "Từng đài" mode', async () => {
    let callIdx = 0;
    (apiDraws.fetchScheduleByDate as jest.Mock).mockImplementation((date: string) => {
      callIdx += 1;
      if (callIdx === 1) {
        return Promise.resolve([{ code: 'ben-tre', name: 'Bến Tre', region: 'SOUTH' }]);
      }
      return new Promise((resolve) =>
        setTimeout(
          () => resolve([{ code: 'tp-hcm', name: 'TP. Hồ Chí Minh', region: 'SOUTH' }]),
          40,
        ),
      );
    });

    const { getByTestId } = await render(<ResultsScreen />, { wrapper: Wrapper });
    await waitFor(() => expect(apiDraws.fetchDraw).toHaveBeenCalledTimes(1));

    // User explicitly taps station chip (setting selectedStation = 'ben-tre')
    await fireEvent.press(getByTestId('station-chips-ben-tre'));
    (apiDraws.fetchDraw as jest.Mock).mockClear();

    // Step to previous date while in "Từng đài" mode; wait for new schedule (40ms) to settle
    await fireEvent.press(getByTestId('results-prev-date-btn'));
    await waitFor(() =>
      expect(apiDraws.fetchDraw).toHaveBeenCalledWith(expect.any(String), 'tp-hcm'),
    );

    // Must have called fetchDraw ONLY ONCE (for 'tp-hcm'), NEVER earlier with stale 'ben-tre'
    expect(apiDraws.fetchDraw).toHaveBeenCalledTimes(1);
  });
});
