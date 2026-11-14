import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResultsScreen from '../(tabs)/results';
import * as apiDraws from '@/api/draws';
import type { StationResponse, DrawResultResponse } from '@/types';

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
    drawDays: ['SATURDAY', 'MONDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'DONG_THAP',
    name: 'Đồng Tháp',
    region: 'SOUTH',
    drawDays: ['MONDAY'],
    liveStreamUrl: null,
  },
];

const mockDrawTPHCM: DrawResultResponse = {
  stationCode: 'TPHCM',
  stationName: 'TP. Hồ Chí Minh',
  drawDate: '2026-11-14',
  prizes: {
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
  status: 'FINAL',
};

const mockDrawDongThap: DrawResultResponse = {
  stationCode: 'DONG_THAP',
  stationName: 'Đồng Tháp',
  drawDate: '2026-11-14',
  prizes: {
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
  status: 'FINAL',
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
});
