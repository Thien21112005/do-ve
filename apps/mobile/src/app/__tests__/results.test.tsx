import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResultsScreen from '../(tabs)/results';
import * as apiDraws from '@/api/draws';
import { STRINGS } from '@/lib/strings';
import type { StationResponse, DrawResponse } from '@/types';

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
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
}

const mockStations: StationResponse[] = [
  {
    code: 'TPHCM',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
  },
  {
    code: 'DONG_THAP',
    name: 'Đồng Tháp',
    region: 'SOUTH',
  },
];

const mockDrawTPHCM: DrawResponse = {
  stationCode: 'TPHCM',
  drawDate: '2026-11-14',
  numbers: {
    SPECIAL: ['123456'],
    FIRST: ['65432'],
    SECOND: ['11223'],
    THIRD: ['33445'],
    FOURTH: ['11111'],
    FIFTH: ['8888'],
    SIXTH: ['9999'],
    SEVENTH: ['345'],
    EIGHTH: ['67'],
  },
};

const mockDrawDongThap: DrawResponse = {
  stationCode: 'DONG_THAP',
  drawDate: '2026-11-14',
  numbers: {
    SPECIAL: ['999999'],
    FIRST: ['88888'],
    SECOND: ['77777'],
    THIRD: ['66666'],
    FOURTH: ['55555'],
    FIFTH: ['4444'],
    SIXTH: ['3333'],
    SEVENTH: ['222'],
    EIGHTH: ['11'],
  },
};

describe('ResultsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue(mockStations);
    (apiDraws.fetchDraw as jest.Mock).mockImplementation((date, station) => {
      if (station === 'DONG_THAP') {
        return Promise.resolve(mockDrawDongThap);
      }
      return Promise.resolve(mockDrawTPHCM);
    });
  });

  it('renders date strip, station chips, and loads initial station draw result', async () => {
    const { getByTestId, getAllByText, getByText } = await render(
      <ResultsScreen />,
      {
        wrapper: createWrapper(),
      },
    );

    expect(getByTestId('results-screen')).toBeTruthy();
    expect(getByTestId('date-strip')).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
      expect(getByTestId('station-chips-DONG_THAP')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getAllByText(/TP. Hồ Chí Minh/i).length).toBeGreaterThanOrEqual(2);
      expect(getByTestId('results-draw-container')).toBeTruthy();
      expect(getByTestId('draw-table')).toBeTruthy();
      expect(getByText('123456')).toBeTruthy();
    });
  });

  it('switches station tab and loads data for the new station', async () => {
    const { getByTestId, getAllByText } = await render(<ResultsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-DONG_THAP')).toBeTruthy(),
    );

    // Switch to Dong Thap
    fireEvent.press(getByTestId('station-chips-DONG_THAP'));

    await waitFor(() => {
      expect(apiDraws.fetchDraw).toHaveBeenCalledWith(
        expect.any(String),
        'DONG_THAP',
      );
      expect(getAllByText(/Đồng Tháp/i).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('switches to all-stations multi-column view and renders MultiStationDrawTable (T10.39)', async () => {
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockResolvedValue([
      mockDrawTPHCM,
      mockDrawDongThap,
    ]);

    const { getByTestId, getByText, getAllByText } = await render(
      <ResultsScreen />,
      {
        wrapper: createWrapper(),
      },
    );

    const allModeBtn = getByTestId('results-view-mode-all');
    fireEvent.press(allModeBtn);

    await waitFor(() => {
      expect(getByTestId('multi-station-draw-table')).toBeTruthy();
      expect(getByText(/Bảng tổng hợp 2 đài/i)).toBeTruthy();
      expect(getAllByText(/TP. Hồ Chí Minh/i).length).toBeGreaterThanOrEqual(1);
      expect(getAllByText(/Đồng Tháp/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('triggers pull-to-refresh on results screen and refetches draw data', async () => {
    const { getByTestId } = await render(<ResultsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('results-scroll-view')).toBeTruthy();
    });

    const scrollView = getByTestId('results-scroll-view');
    const refreshControl = scrollView.props.refreshControl;
    expect(refreshControl).toBeDefined();

    const initialCalls = (apiDraws.fetchDraw as jest.Mock).mock.calls.length;
    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(
        (apiDraws.fetchDraw as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(initialCalls);
    });
  });

  it('uses Vietnam date for initial selected date during 0h-7h UTC boundary (T09.16)', async () => {
    // 2026-11-14 20:00:00 UTC is 2026-11-15 03:00:00 in Vietnam
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-14T20:00:00Z'));

    await render(<ResultsScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(apiDraws.fetchScheduleByDate).toHaveBeenCalledWith('2026-11-15');
    });

    jest.useRealTimers();
  });

  it('does NOT flash empty state "Chưa có kết quả" before station is selected (T09.29)', async () => {
    // Delay schedule response so station selection does not happen immediately
    (apiDraws.fetchScheduleByDate as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve(mockStations), 100)),
    );

    const { queryByText } = await render(<ResultsScreen />, {
      wrapper: createWrapper(),
    });

    // While waiting for station selection, it should show loading/skeleton, NOT empty state!
    expect(queryByText(STRINGS.results.emptyTitle)).toBeNull();
  });

  it('displays error state with retry button when draw fetch fails with network error (T09.30)', async () => {
    (apiDraws.fetchDraw as jest.Mock).mockRejectedValue(
      new Error('Network request failed'),
    );

    const { findByTestId, queryByText } = await render(<ResultsScreen />, {
      wrapper: createWrapper(),
    });

    const retryBtn = await findByTestId('results-error-retry-btn');
    expect(retryBtn).toBeTruthy();
    expect(queryByText(STRINGS.results.emptyTitle)).toBeNull();
  });
});
