import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AboutScreen from '../about';

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

  it('opens mail app when contact email is pressed (T10.55)', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    const { getByTestId } = await render(<AboutScreen />);

    const emailLink = getByTestId('about-contact-email');
    expect(emailLink.props.accessibilityRole).toBe('link');

    fireEvent.press(emailLink);
    expect(openURLSpy).toHaveBeenCalledWith('mailto:contact@dove.vn');
  });

  it('opens website in browser when contact website is pressed (T10.55)', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    const { getByTestId } = await render(<AboutScreen />);

    const webLink = getByTestId('about-contact-website');
    expect(webLink.props.accessibilityRole).toBe('link');

    fireEvent.press(webLink);
    expect(openURLSpy).toHaveBeenCalledWith(expect.stringMatching(/^https?:\/\/dove\./));
  });

  it('uses title case headers with weight and avoids card container for long text paragraphs (T10.55)', async () => {
    const { getByText, getByTestId } = await render(<AboutScreen />);

    // Headers should not be uppercase
    expect(getByText('Miễn trừ trách nhiệm')).toBeTruthy();
    expect(getByText('Nguồn dữ liệu kết quả')).toBeTruthy();
    expect(getByText('Quyền riêng tư & dữ liệu')).toBeTruthy();
    expect(getByText('Liên hệ & hỗ trợ')).toBeTruthy();

    // Long text sections should be flat (borderWidth: 0, no card background)
    const disclaimerContainer = getByTestId('about-disclaimer-card');
    const flatStyles = [disclaimerContainer.props.style].flat();
    const hasBorder = flatStyles.some((s) => s && s.borderWidth && s.borderWidth > 0);
    expect(hasBorder).toBe(false);
  });
});
