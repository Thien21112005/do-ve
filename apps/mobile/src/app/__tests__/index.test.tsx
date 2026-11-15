import React from 'react';
import type { ReactNode } from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from '../(tabs)/index';
import CheckScreen from '../(tabs)/check';
import ResultsScreen from '../(tabs)/results';
import TicketsScreen from '../(tabs)/tickets';
import MoreScreen from '../(tabs)/more';
import * as apiDraws from '@/api/draws';
import type { DrawResponse, StationResponse } from '@/types';

jest.mock('@/api/draws');

const mockStations: StationResponse[] = [
  {
    code: 'tp-hcm',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
  },
];

const mockLatestDraws: DrawResponse[] = [
  {
    stationCode: 'tp-hcm',
    drawDate: '2026-11-14',
    numbers: {
      SPECIAL: ['654321'],
      FIRST: ['12345'],
      EIGHTH: ['89'],
    },
  },
  {
    stationCode: 'dong-thap',
    drawDate: '2026-11-14',
    numbers: {
      SPECIAL: ['999999'],
      FIRST: ['88888'],
      EIGHTH: ['11'],
    },
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
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockResolvedValue(mockLatestDraws);
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

    const initialCalls = (apiDraws.fetchLatestDayDraws as jest.Mock).mock.calls
      .length;
    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(
        (apiDraws.fetchLatestDayDraws as jest.Mock).mock.calls.length,
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

  it('deep links Home cards to station results with station and date params (T09.34)', async () => {
    const { useRouter } = require('expo-router');
    const router = useRouter();
    const { getAllByText, getByText } = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByText('Xem toàn bộ bảng giải').length).toBeGreaterThan(0);
    });

    // Click "Xem toàn bộ bảng giải" on the first card
    const viewDetailsButtons = getAllByText('Xem toàn bộ bảng giải');
    fireEvent.press(viewDetailsButtons[0]);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/results',
      params: {
        station: 'tp-hcm',
        date: '2026-11-14',
      },
    });

    // Click "Xem tất cả"
    const viewAllBtn = getByText('Xem tất cả');
    fireEvent.press(viewAllBtn);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/results',
      params: {
        date: '2026-11-14',
      },
    });
  });
});
