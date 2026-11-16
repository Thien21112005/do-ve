import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MoreScreen from '../(tabs)/more';
import { useRouter } from 'expo-router';

describe('MoreScreen (Thêm)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders native grouped style list with sections and rows (T10.52)', async () => {
    const { getByText, getByTestId } = await render(<MoreScreen />);

    // Screen title and subtitle
    expect(getByText('Thêm')).toBeTruthy();
    expect(
      getByText('Lịch quay số, Giới thiệu và Cài đặt ứng dụng'),
    ).toBeTruthy();

    // Section headers: Tiện ích & Ứng dụng
    expect(getByText('Tiện ích')).toBeTruthy();
    expect(getByText('Ứng dụng')).toBeTruthy();

    // Menu rows
    expect(getByTestId('more-menu-schedule')).toBeTruthy();
    expect(getByText('Lịch quay thưởng')).toBeTruthy();

    expect(getByTestId('more-menu-settings')).toBeTruthy();
    expect(getByText('Cài đặt')).toBeTruthy();

    expect(getByTestId('more-menu-about')).toBeTruthy();
    expect(getByText('Giới thiệu & Miễn trừ trách nhiệm')).toBeTruthy();

    // Privacy notice
    expect(getByTestId('more-privacy-notice')).toBeTruthy();
    expect(
      getByText('Vé chỉ lưu trên máy này, không gửi lên server.'),
    ).toBeTruthy();

    // Single-line footer version
    expect(getByTestId('more-version-footer')).toBeTruthy();
    expect(getByText(/DoVe phiên bản 1\.0\.0/)).toBeTruthy();
  });

  it('navigates to respective screens when pressing rows', async () => {
    const router = useRouter();
    const { getByTestId } = await render(<MoreScreen />);

    fireEvent.press(getByTestId('more-menu-schedule'));
    expect(router.push).toHaveBeenCalledWith('/schedule');

    fireEvent.press(getByTestId('more-menu-settings'));
    expect(router.push).toHaveBeenCalledWith('/settings');

    fireEvent.press(getByTestId('more-menu-about'));
    expect(router.push).toHaveBeenCalledWith('/about');
  });
});
