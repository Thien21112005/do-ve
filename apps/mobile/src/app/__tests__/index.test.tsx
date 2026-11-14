import React, { type ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from '../(tabs)/index';
import CheckScreen from '../(tabs)/check';
import ResultsScreen from '../(tabs)/results';
import TicketsScreen from '../(tabs)/tickets';
import MoreScreen from '../(tabs)/more';

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
  it('renders HomeScreen correctly', async () => {
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('DoVe')).toBeTruthy();
    expect(getByText('Ứng dụng dò vé số kiến thiết miền Nam')).toBeTruthy();
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
    const { getByText } = await render(<ResultsScreen />);
    expect(getByText('Kết quả')).toBeTruthy();
    expect(
      getByText('Bảng kết quả xổ số kiến thiết 21 đài miền Nam'),
    ).toBeTruthy();
  });

  it('renders TicketsScreen correctly', async () => {
    const { getByText } = await render(<TicketsScreen />);
    expect(getByText('Vé của tôi')).toBeTruthy();
    expect(getByText('Lưu trữ và theo dõi các vé số đã dò')).toBeTruthy();
  });

  it('renders MoreScreen correctly', async () => {
    const { getByText } = await render(<MoreScreen />);
    expect(getByText('Thêm')).toBeTruthy();
    expect(
      getByText('Lịch quay số, Giới thiệu và Cài đặt ứng dụng'),
    ).toBeTruthy();
  });
});
