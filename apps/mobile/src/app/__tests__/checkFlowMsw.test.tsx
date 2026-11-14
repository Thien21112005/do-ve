import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';
import { ApiError } from '@/api';
import { STRINGS } from '@/lib/strings';

jest.mock('@/api/draws');
jest.mock('@/api/check');
jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'CheckFlowMswWrapper';
  return Wrapper;
}

describe('T06.33 - Core Ticket Check Flow (6 Test Cases)', () => {
  const mockSchedule = [
    {
      code: 'TPHCM',
      name: 'TP. Hồ Chí Minh',
      region: 'SOUTH',
      drawDays: ['SATURDAY'],
      liveStreamUrl: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue(mockSchedule);
  });

  // Ca 1: Nhập vé và kiểm tra validation inline
  it('Case 1: User inputs ticket, validates inline incomplete warning, and enables check button', async () => {
    const { getByTestId, queryByTestId, getByText } = await render(
      <CheckScreen />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    const checkBtn = getByTestId('check-ticket-button');
    expect(checkBtn.props.accessibilityState.disabled).toBe(true);

    // Enter partial 5 digits
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '12345');
    await waitFor(() => {
      expect(getByTestId('ticket-validation-error')).toBeTruthy();
      expect(
        getByText(STRINGS.check.validationIncomplete(5)),
      ).toBeTruthy();
      expect(checkBtn.props.accessibilityState.disabled).toBe(true);
    });

    // Complete the 6th digit
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');
    await waitFor(() => {
      expect(queryByTestId('ticket-validation-error')).toBeNull();
      expect(checkBtn.props.accessibilityState.disabled).toBe(false);
    });
  });

  // Ca 2: Dò trúng giải
  it('Case 2: Winning ticket check renders prize details, matched suffix, and celebratory total prize', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Giải Đặc biệt',
          prizeAmount: 2000000000,
          matchedDigits: '123456',
        },
      ],
      totalPrize: 2000000000,
      message: null,
    });

    const { getByTestId, getByText, getAllByText } = await render(
      <CheckScreen />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');
    await waitFor(() =>
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false),
    );

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('check-result-section')).toBeTruthy();
      expect(getByText(STRINGS.check.resultWonTitle)).toBeTruthy();
      expect(getByText('Giải Đặc biệt')).toBeTruthy();
      expect(getAllByText(/2.000.000.000 đ/).length).toBeGreaterThanOrEqual(1);
    });
  });

  // Ca 3: Dò trượt / không trúng
  it('Case 3: Losing ticket check renders polite non-winning message with 0 đ', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '654321',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalPrize: 0,
      message: null,
    });

    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '654321');
    await waitFor(() =>
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false),
    );

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('check-result-section')).toBeTruthy();
      expect(getByText(STRINGS.check.resultLostTitle)).toBeTruthy();
      expect(getByText(STRINGS.check.resultLostSubtitle)).toBeTruthy();
    });
  });

  // Ca 4: Chưa có kết quả mở thưởng (RESULT_NOT_AVAILABLE)
  it('Case 4: Check before draw time displays RESULT_NOT_AVAILABLE with 16h30 notice and retry button', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '777888',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'RESULT_NOT_AVAILABLE',
      won: null,
      wins: [],
      totalPrize: 0,
      message: 'Chưa có kết quả',
    });

    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '777888');
    await waitFor(() =>
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false),
    );

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('check-result-section')).toBeTruthy();
      expect(getByText(STRINGS.check.resultPendingTitle)).toBeTruthy();
      expect(getByText(STRINGS.check.pendingNotice)).toBeTruthy();
      expect(getByTestId('result-card-retry-btn')).toBeTruthy();
    });
  });

  // Ca 5: Lỗi mạng hoặc lỗi API (giữ nguyên dữ liệu input)
  it('Case 5: Network or server error displays error banner and preserves entered digits in inputs', async () => {
    const networkError = new ApiError({
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      detail: 'Không thể kết nối đến máy chủ quay số',
    });
    (apiCheck.checkTicket as jest.Mock).mockRejectedValue(networkError);

    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');
    await waitFor(() =>
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false),
    );

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('api-error-banner')).toBeTruthy();
      expect(getByText('Không thể kết nối đến máy chủ quay số')).toBeTruthy();
      expect(getByText(STRINGS.check.dataPreservedNotice)).toBeTruthy();

      // Ensure input digits are preserved
      expect(getByTestId('ticket-input-digit-0').props.value).toBe('1');
      expect(getByTestId('ticket-input-digit-1').props.value).toBe('2');
      expect(getByTestId('ticket-input-digit-2').props.value).toBe('3');
      expect(getByTestId('ticket-input-digit-3').props.value).toBe('4');
      expect(getByTestId('ticket-input-digit-4').props.value).toBe('5');
      expect(getByTestId('ticket-input-digit-5').props.value).toBe('6');
    });
  });

  // Ca 6: Thử lại khi có lỗi phục hồi thành công
  it('Case 6: Pressing retry recovers from previous error and renders result successfully', async () => {
    // First call fails
    (apiCheck.checkTicket as jest.Mock).mockRejectedValueOnce(
      new ApiError({
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        detail: 'Hệ thống đang quá tải',
      }),
    );

    const { getByTestId, getByText, queryByTestId } = await render(
      <CheckScreen />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() =>
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy(),
    );

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '888999');
    await waitFor(() =>
      expect(
        getByTestId('check-ticket-button').props.accessibilityState.disabled,
      ).toBe(false),
    );

    fireEvent.press(getByTestId('check-ticket-button'));

    await waitFor(() => {
      expect(getByTestId('api-error-banner')).toBeTruthy();
      expect(getByText('Hệ thống đang quá tải')).toBeTruthy();
    });

    // Mock second call succeeds
    (apiCheck.checkTicket as jest.Mock).mockResolvedValueOnce({
      ticket: '888999',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalPrize: 0,
      message: null,
    });

    // Press retry on the error banner
    fireEvent.press(getByTestId('api-error-retry-btn'));

    await waitFor(() => {
      expect(queryByTestId('api-error-banner')).toBeNull();
      expect(getByTestId('check-result-section')).toBeTruthy();
      expect(getByText(STRINGS.check.resultLostTitle)).toBeTruthy();
    });
  });
});
