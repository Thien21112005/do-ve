import React from 'react';
import type { ReactNode } from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import HomeScreen from '../(tabs)/index';
import CheckScreen from '../(tabs)/check';
import ResultsScreen from '../(tabs)/results';
import TicketsScreen from '../(tabs)/tickets';
import MoreScreen from '../(tabs)/more';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';
import type { DrawResponse, StationResponse } from '@/types';

jest.mock('@/api/draws');
jest.mock('@/api/check');

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
    (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValue({
      stationCode: 'tp-hcm',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      results: [],
      totalAmount: 0,
      totalPrize: 0,
      totalWonTickets: 0,
      totalTickets: 0,
    });
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '654321',
      stationCode: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'DRAWN',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Đặc biệt',
          prizeAmount: 2000000000,
          matchedNumber: '654321',
          matchedDigits: '654321',
        },
      ],
      totalAmount: 2000000000,
    });
  });

  it('renders HomeScreen with latest draws and quick check card', async () => {
    const { getByText, getAllByText, getByTestId } = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByText('DoVe')).toBeTruthy();
    expect(getByTestId('home-today-status')).toBeTruthy();
    expect(getByText('Dò vé nhanh')).toBeTruthy();
    expect(getByTestId('home-quick-check-btn')).toBeTruthy();

    await waitFor(() => {
      expect(getAllByText('TP. Hồ Chí Minh').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Đồng Tháp').length).toBeGreaterThanOrEqual(1);
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

  it('allows checking a ticket directly on HomeScreen without switching tabs (T10.18)', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '654321',
      stationCode: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'DRAWN',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Đặc biệt',
          prizeAmount: 2000000000,
          matchedNumber: '654321',
          matchedDigits: '654321',
        },
      ],
      totalAmount: 2000000000,
    });

    const rendered = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(rendered.getByTestId('home-today-status')).toBeTruthy();
      expect(rendered.getByTestId('home-my-tickets-shortcut')).toBeTruthy();
      expect(rendered.getByTestId('home-ticket-input')).toBeTruthy();
    });

    // Input 6 digits into the home ticket input
    const ticketInput = rendered.getByTestId('home-ticket-input');
    fireEvent.changeText(ticketInput, '654321');

    // Wait for the button to become enabled
    await waitFor(() => {
      const checkBtn = rendered.getByTestId('home-quick-check-btn');
      expect(checkBtn.props.accessibilityState.disabled).toBe(false);
    });

    // Press quick check button
    const checkBtn = rendered.getByTestId('home-quick-check-btn');
    fireEvent.press(checkBtn);

    // Check that inline result appears without switching tabs
    await waitFor(() => {
      expect(apiCheck.checkTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket: '654321',
        }),
      );
      expect(rendered.getByTestId('home-quick-check-result')).toBeTruthy();
      expect(rendered.getByText(/Trúng thưởng/i)).toBeTruthy();
      expect(rendered.getByTestId('home-save-ticket-btn')).toBeTruthy();
    });
  });

  it('shows live drawing state during draw window 16h10 to 16h40 VN (T10.20)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dateModule = require('@/lib/date');
    const spyNow = jest.spyOn(dateModule, 'nowVN').mockReturnValue({
      year: 2026,
      month: 11,
      day: 15,
      hour: 16,
      minute: 20,
      second: 0,
    });
    const spyLive = jest
      .spyOn(dateModule, 'isLiveDrawingVN')
      .mockReturnValue(true);

    try {
      const { getByTestId, getByText } = await render(<HomeScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(getByTestId('home-today-status')).toBeTruthy();
          expect(getByText(/Đang quay/)).toBeTruthy();
          expect(getByTestId('home-live-pulse-dot')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    } finally {
      spyNow.mockRestore();
      spyLive.mockRestore();
    }
  });

  it('renders realistic home draws skeleton while loading (T10.21)', async () => {
    let resolveDraws: (val: any) => void = () => {};
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveDraws = resolve;
      }),
    );

    const { getByTestId, queryByTestId } = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('home-draws-loading')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-0')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-1')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-2')).toBeTruthy();

    await act(async () => {
      resolveDraws(mockLatestDraws);
    });

    await waitFor(() => {
      expect(queryByTestId('home-draws-loading')).toBeNull();
      expect(getByTestId('latest-draw-card-tp-hcm')).toBeTruthy();
    });
  });

  it('renders CheckScreen correctly', async () => {
    const { getByText, getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });
    expect(getByTestId('check-context-box')).toBeTruthy();
    expect(getByText('Kỳ mở thưởng')).toBeTruthy();
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

  it('deep links Home cards to station results with station and date params (T09.34, T10.19)', async () => {
    const router = useRouter();
    const { getAllByText, getByText, getByTestId } = await render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getAllByText('Xem toàn bộ bảng giải').length).toBeGreaterThan(0);
    });

    // Click entire card to navigate (T10.19)
    const firstCard = getByTestId('latest-draw-card-tp-hcm');
    fireEvent.press(firstCard);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/results',
      params: {
        station: 'tp-hcm',
        date: '2026-11-14',
      },
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
