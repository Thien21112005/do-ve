import React, { type ReactNode } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from '../(tabs)/index';
import CheckScreen from '../(tabs)/check';
import ResultsScreen from '../(tabs)/results';
import TicketsScreen from '../(tabs)/tickets';
import MoreScreen from '../(tabs)/more';
import * as apiDraws from '@/api/draws';
import type { DrawResultResponse, StationResponse } from '@/types';

jest.mock('@/api/draws');

const mockStations: StationResponse[] = [
  {
    code: 'TPHCM',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
    drawDays: ['SATURDAY', 'MONDAY'],
    liveStreamUrl: null,
  },
];

const mockLatestDraws: DrawResultResponse[] = [
  {
    stationCode: 'TPHCM',
    stationName: 'TP. Hồ Chí Minh',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['654321'],
      FIRST: ['12345'],
      EIGHTH: ['89'],
    },
    status: 'FINAL',
  },
  {
    stationCode: 'DONG_THAP',
    stationName: 'Đồng Tháp',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['999999'],
      FIRST: ['88888'],
      EIGHTH: ['11'],
    },
    status: 'FINAL',
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
  Wrapper.displayName = 'TabsTestQueryWrapper';
  return Wrapper;
}

describe('Tab Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue(mockStations);
    (apiDraws.fetchDraw as jest.Mock).mockResolvedValue(mockLatestDraws[0]);
    (apiDraws.fetchLatestDraws as jest.Mock).mockResolvedValue(mockLatestDraws);
  });

  it('renders HomeScreen with latest draws and quick check card', async () => {
    const { getByText, getByTestId } = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByText('DoVe')).toBeTruthy();
    expect(getByText('Dò vé nhanh')).toBeTruthy();
    expect(getByTestId('home-quick-check-btn')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('TP. Hồ Chí Minh')).toBeTruthy();
      expect(getByText('Đồng Tháp')).toBeTruthy();
      expect(getByText('654321')).toBeTruthy();
      expect(getByText('999999')).toBeTruthy();
    });
  });

  it('triggers pull-to-refresh on HomeScreen', async () => {
    const { getByTestId } = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('home-scroll-view')).toBeTruthy();
    });

    const scrollView = getByTestId('home-scroll-view');
    const refreshControl = scrollView.props.refreshControl;
    expect(refreshControl).toBeDefined();

    const initialCalls = (apiDraws.fetchLatestDraws as jest.Mock).mock.calls
      .length;
    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(
        (apiDraws.fetchLatestDraws as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(initialCalls);
    });
  });

  it('renders CheckScreen correctly', async () => {
    const { getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });
    expect(getByText('1. Chọn ngày mở thưởng')).toBeTruthy();
    expect(getByText('2. Chọn đài quay')).toBeTruthy();
    expect(getByText('3. Nhập 6 chữ số trên vé')).toBeTruthy();
  });

  it('renders ResultsScreen correctly', async () => {
    const { getByText } = await render(<ResultsScreen />, {
      wrapper: createWrapper(),
    });
    expect(getByText('Chọn ngày mở thưởng')).toBeTruthy();
  });

  it('renders TicketsScreen correctly', async () => {
    const { getByText } = await render(<TicketsScreen />);
    expect(getByText('Vé của tôi')).toBeTruthy();
    expect(getByText('Lưu trữ và theo dõi các vé số đã dò')).toBeTruthy();
  });

  it('renders MoreScreen correctly', async () => {
    const { getByText, getByTestId } = await render(<MoreScreen />);
    expect(getByText('Thêm')).toBeTruthy();
    expect(
      getByText('Lịch quay số, Giới thiệu và Cài đặt ứng dụng'),
    ).toBeTruthy();
    expect(getByTestId('more-privacy-notice')).toBeTruthy();
    expect(
      getByText('Vé chỉ lưu trên máy này, không gửi lên server.'),
    ).toBeTruthy();
  });
});
