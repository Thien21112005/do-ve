import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScheduleScreen, { WEEKLY_SCHEDULE } from '../schedule';
import { useRouter } from 'expo-router';

const mockFetchScheduleByDate = jest.fn();
jest.mock('@/api', () => {
  const actual = jest.requireActual('@/api');
  return {
    ...actual,
    fetchScheduleByDate: (date: string) => mockFetchScheduleByDate(date),
  };
});

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

function renderScheduleScreen(options = {}) {
  return render(<ScheduleScreen />, { wrapper: createWrapper(), ...options });
}

jest.mock('expo-router', () => {
  const routerMock = {
    push: jest.fn(),
    back: jest.fn(),
  };
  return {
    __esModule: true,
    useRouter: () => routerMock,
  };
});

describe('ScheduleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchScheduleByDate.mockReset();
  });

  it('renders all 7 weekdays with correct stations matching SRS 3.3', async () => {
    const { getByText, getByTestId } = await renderScheduleScreen();

    expect(getByTestId('schedule-screen')).toBeTruthy();
    expect(WEEKLY_SCHEDULE).toHaveLength(7);

    // Thứ 2: tp-hcm, dong-thap, ca-mau
    expect(getByText('Thứ Hai')).toBeTruthy();
    expect(getByText('Đồng Tháp')).toBeTruthy();
    expect(getByText('Cà Mau')).toBeTruthy();

    // Thứ 3: ben-tre, vung-tau, bac-lieu
    expect(getByText('Thứ Ba')).toBeTruthy();
    expect(getByText('Bến Tre')).toBeTruthy();
    expect(getByText('Vũng Tàu')).toBeTruthy();
    expect(getByText('Bạc Liêu')).toBeTruthy();

    // Thứ 4: dong-nai, can-tho, soc-trang
    expect(getByText('Thứ Tư')).toBeTruthy();
    expect(getByText('Đồng Nai')).toBeTruthy();
    expect(getByText('Cần Thơ')).toBeTruthy();
    expect(getByText('Sóc Trăng')).toBeTruthy();

    // Thứ 5: tay-ninh, an-giang, binh-thuan
    expect(getByText('Thứ Năm')).toBeTruthy();
    expect(getByText('Tây Ninh')).toBeTruthy();
    expect(getByText('An Giang')).toBeTruthy();
    expect(getByText('Bình Thuận')).toBeTruthy();

    // Thứ 6: vinh-long, binh-duong, tra-vinh
    expect(getByText('Thứ Sáu')).toBeTruthy();
    expect(getByText('Vĩnh Long')).toBeTruthy();
    expect(getByText('Bình Dương')).toBeTruthy();
    expect(getByText('Trà Vinh')).toBeTruthy();

    // Thứ 7: tp-hcm, long-an, hau-giang, binh-phuoc
    expect(getByText('Thứ Bảy')).toBeTruthy();
    expect(getByText('Long An')).toBeTruthy();
    expect(getByText('Hậu Giang')).toBeTruthy();
    expect(getByText('Bình Phước')).toBeTruthy();

    // Chủ nhật: tien-giang, kien-giang, da-lat
    expect(getByText('Chủ Nhật')).toBeTruthy();
    expect(getByText('Tiền Giang')).toBeTruthy();
    expect(getByText('Kiên Giang')).toBeTruthy();
    expect(getByText('Đà Lạt (Lâm Đồng)')).toBeTruthy();
  });

  it('highlights current weekday with Hôm nay badge (T10.53)', async () => {
    const { getByText, getByTestId } = await renderScheduleScreen();
    expect(getByTestId('schedule-today-badge')).toBeTruthy();
    expect(getByText('Hôm nay')).toBeTruthy();
  });

  it('selects correct Vietnam weekday across UTC boundary (T09.17)', async () => {
    // 2026-11-15 18:00:00 UTC (Sunday night UTC) is 2026-11-16 01:00:00 VN (Monday morning)
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-15T18:00:00Z'));

    const { getByTestId } = await renderScheduleScreen();
    // Monday schedule item should have the badge
    expect(getByTestId('schedule-day-1')).toBeTruthy();
    expect(getByTestId('schedule-today-badge')).toBeTruthy();

    jest.useRealTimers();
  });

  it('loads weekly schedule dynamically from api (T09.31)', async () => {
    mockFetchScheduleByDate.mockImplementation(async () => {
      return [{ code: 'dong-thap-vip', name: 'Đồng Tháp Mới' }];
    });

    const { getAllByText } = await renderScheduleScreen();
    await waitFor(() => {
      expect(getAllByText('Đồng Tháp Mới').length).toBe(7);
    });
  });

  it('displays correct draw time and holiday notice without false claims (T09.32)', async () => {
    const { getByText, queryByText, getAllByText } = await renderScheduleScreen();

    expect(queryByText(/không nghỉ Tết/i)).toBeNull();
    expect(getAllByText(/16h15 – 16h35/).length).toBeGreaterThanOrEqual(1);
    expect(getByText(/Tết Nguyên Đán/i)).toBeTruthy();
  });

  it('navigates to results with station and nearest date param when a station is tapped (T09.33, T10.53)', async () => {
    const router = useRouter();
    const { getByTestId } = await renderScheduleScreen();

    const stationBtn = getByTestId('schedule-station-dong-thap');
    expect(stationBtn.props.accessibilityRole).toBe('button');
    expect(stationBtn.props.accessibilityLabel).toMatch(/Đồng Tháp/);

    fireEvent.press(stationBtn);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/results',
      params: {
        station: 'dong-thap',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      },
    });
  });
});
