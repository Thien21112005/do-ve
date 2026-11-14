import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScheduleScreen, { WEEKLY_SCHEDULE } from '../schedule';
import { useRouter } from 'expo-router';

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
  });

  it('renders all 7 weekdays with correct stations matching SRS 3.3', async () => {
    const { getByText, getByTestId } = await render(<ScheduleScreen />);

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

  it('highlights current weekday with Hôm nay badge', async () => {
    const { getByText, getByTestId } = await render(<ScheduleScreen />);
    expect(getByTestId('schedule-today-badge')).toBeTruthy();
    expect(getByText('HÔM NAY')).toBeTruthy();
  });

  it('handles back button navigation', async () => {
    const router = useRouter();
    const { getByTestId } = await render(<ScheduleScreen />);

    const backBtn = getByTestId('schedule-back-btn');
    fireEvent.press(backBtn);

    expect(router.back).toHaveBeenCalled();
  });
});
