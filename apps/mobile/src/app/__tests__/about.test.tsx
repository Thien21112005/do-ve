import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AboutScreen from '../about';
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

describe('AboutScreen (Giới thiệu & Miễn trừ)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all branding, disclaimer, data source, and privacy cards', async () => {
    const { getByTestId, getByText } = await render(<AboutScreen />);

    expect(getByTestId('about-screen')).toBeTruthy();
    expect(getByText('Giới thiệu & Miễn trừ')).toBeTruthy();
    expect(getByText('DoVe')).toBeTruthy();
    expect(getByTestId('about-version-badge')).toBeTruthy();
    expect(getByTestId('about-disclaimer-card')).toBeTruthy();
    expect(getByTestId('about-datasource-card')).toBeTruthy();
    expect(getByTestId('about-privacy-card')).toBeTruthy();
    expect(getByTestId('about-contact-card')).toBeTruthy();
    expect(
      getByText(/Vé chỉ lưu trên máy này, không gửi lên server\./),
    ).toBeTruthy();
    expect(getByText('contact@dove.vn')).toBeTruthy();
  });

  it('navigates back when pressing back button', async () => {
    const router = useRouter();
    const { getByTestId } = await render(<AboutScreen />);

    const backBtn = getByTestId('about-back-btn');
    fireEvent.press(backBtn);

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
