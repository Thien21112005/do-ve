import React from 'react';
import type { ReactNode } from 'react';
import { render, fireEvent, waitFor, configure } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';
import * as apiCheck from '@/api/check';
import { getTickets, clearAllTickets } from '@/store/ticketStore';
import NetInfo from '@react-native-community/netinfo';
import { haptics } from '@/lib/haptics';

configure({ asyncUtilTimeout: 3000 });

jest.mock('@/api/draws');
jest.mock('@/api/check');
jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    selection: jest.fn(),
  },
}));

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
  Wrapper.displayName = 'CheckScreenQueryWrapper';
  return Wrapper;
}

describe('CheckScreen Form Composition', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearAllTickets();
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      {
        code: 'TPHCM',
        name: 'TP. Hồ Chí Minh',
        region: 'SOUTH',
        drawDays: ['SATURDAY'],
        liveStreamUrl: null,
      },
    ]);
  });

  it('renders all sections and disables submit button when ticket is incomplete', async () => {
    const { getByText, getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('check-context-box')).toBeTruthy();
    expect(getByText('Kỳ mở thưởng')).toBeTruthy();
    expect(getByTestId('date-strip')).toBeTruthy();
    expect(getByTestId('station-chips')).toBeTruthy();
    expect(getByText('3. Nhập 6 chữ số trên vé')).toBeTruthy();

    const submitBtn = getByTestId('check-ticket-button');
    expect(submitBtn.props.accessibilityState.disabled).toBe(true);
  });

  it('merges date and station into one context box with result indicators (T10.24)', async () => {
    const { getByTestId, getAllByTestId, queryByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Separate standalone headers should no longer exist
    expect(queryByText('1. Chọn ngày mở thưởng')).toBeNull();
    expect(queryByText('2. Chọn đài quay')).toBeNull();

    // Context box contains both date strip and station chips
    const contextBox = getByTestId('check-context-box');
    expect(contextBox).toBeTruthy();

    // Past date chips should render a result indicator dot
    const pastDots = getAllByTestId('date-strip-chip-dot-past');
    expect(pastDots.length).toBeGreaterThan(0);
  });

  it('renders segmented control for single and batch modes with accessibility roles (T10.26)', async () => {
    const { getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    const tablist = getByTestId('mode-segmented');
    expect(tablist.props.accessibilityRole).toBe('tablist');

    const singleTab = getByTestId('mode-single-btn');
    expect(singleTab.props.accessibilityRole).toBe('tab');
    expect(singleTab.props.accessibilityState.selected).toBe(true);

    const batchTab = getByTestId('mode-batch-btn');
    expect(batchTab.props.accessibilityRole).toBe('tab');
    expect(batchTab.props.accessibilityState.selected).toBe(false);

    // Switch to batch mode
    fireEvent.press(batchTab);
    await waitFor(() => {
      expect(getByTestId('mode-batch-btn').props.accessibilityState.selected).toBe(true);
      expect(getByTestId('mode-single-btn').props.accessibilityState.selected).toBe(false);
    });
  });

  it('renders sticky bottom check CTA with reason when disabled (T10.27)', async () => {
    const { getByTestId, getByText } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    const ctaBar = getByTestId('sticky-cta-bar');
    expect(ctaBar).toBeTruthy();

    const submitBtn = getByTestId('check-ticket-button');
    expect(submitBtn.props.accessibilityState.disabled).toBe(true);
    expect(getByText(/Nhập đủ 6 số/)).toBeTruthy();

    const btnStyle = Array.isArray(submitBtn.props.style)
      ? Object.assign({}, ...submitBtn.props.style)
      : submitBtn.props.style;
    expect(btnStyle.minHeight || btnStyle.height).toBeGreaterThanOrEqual(52);
  });

  it('does not trigger warning haptics when 5 digits are typed (T10.28)', async () => {
    const { getByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '12345');
    expect(haptics.warning).not.toHaveBeenCalled();
    expect(apiCheck.checkTicket).not.toHaveBeenCalled();
  });

  it('automatically submits check and dismisses keyboard when 6 digits are typed (T10.28)', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalAmount: 0,
      totalPrize: 0,
    });

    const { getByTestId, findByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '123456');

    await waitFor(() => {
      expect(apiCheck.checkTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket: '123456',
          stationCode: 'TPHCM',
        }),
      );
    });
    expect(await findByTestId('check-result-section')).toBeTruthy();
  });

  it('enables submit button and calls check API when ticket is fully filled', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '987654',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [],
      totalPrize: 2000000000,
      message: null,
    });

    const { getByTestId, findByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    // Wait for station chips to render
    await waitFor(() => {
      expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
    });

    // Enter 6 digits in TicketInput
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '987654');

    await waitFor(() => {
      const submitBtn = getByTestId('check-ticket-button');
      expect(submitBtn.props.accessibilityState.disabled).toBe(false);
    });

    const submitBtn = getByTestId('check-ticket-button');
    fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(apiCheck.checkTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket: '987654',
          stationCode: 'TPHCM',
        }),
      );
    });
    expect(await findByTestId('check-result-section')).toBeTruthy();
  });

  it('saves ticket into ticketStore when pressing save button on ResultCard', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '012345',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Giải Đặc Biệt',
          prizeAmount: 2000000000,
          matchedDigits: '012345',
        },
      ],
      totalPrize: 2000000000,
      message: null,
    });

    const { getByTestId, findByTestId, findByText } = await render(
      <CheckScreen />,
      { wrapper: createWrapper() },
    );

    // Fill ticket 012345 - auto-submits under T10.28
    await findByTestId('station-chips-TPHCM');
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '012345');

    // Save button should appear
    const saveBtn = await findByTestId('result-card-save-btn');
    expect(saveBtn).toBeTruthy();

    // Press save button
    fireEvent.press(saveBtn);

    // Verify ticket is saved in ticketStore
    await waitFor(async () => {
      const saved = await getTickets();
      expect(saved.length).toBe(1);
      expect(saved[0].ticket).toBe('012345');
      expect(saved[0].station).toBe('TPHCM');
      expect(saved[0].status).toBe('WON');
      expect(saved[0].totalPrize).toBe(2000000000);
    });

    // Button should now display "Đã lưu vé"
    expect(await findByText('Đã lưu vé')).toBeTruthy();
  });

  it('clears stale check result card when ticket number or station changes (T09.20)', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '112233',
      stationCode: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalAmount: 0,
    });

    const { getByTestId, findByTestId, queryByTestId } = await render(
      <CheckScreen />,
      { wrapper: createWrapper() },
    );

    await findByTestId('station-chips-TPHCM');
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '112233');

    const submitBtn = await findByTestId('check-ticket-button');
    fireEvent.press(submitBtn);

    // Result card appears
    await waitFor(() => {
      expect(getByTestId('check-result-section')).toBeTruthy();
    });

    // Now edit/delete digit from ticket number (e.g. backspace)
    fireEvent.changeText(getByTestId('ticket-input-digit-5'), '');

    // Stale result card must disappear immediately
    await waitFor(() => {
      expect(queryByTestId('check-result-section')).toBeNull();
    });
  });

  it('offline banner retry does not trigger submitCheck or warning haptics (T09.21)', async () => {
    (NetInfo.useNetInfo as jest.Mock).mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { findByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    const retryBtn = await findByTestId('offline-banner-retry-btn');
    fireEvent.press(retryBtn);

    expect(apiCheck.checkTicket).not.toHaveBeenCalled();
    expect(haptics.warning).not.toHaveBeenCalled();
  });

  it('triggers haptics.success exactly once on winning check (T09.22)', async () => {
    (apiCheck.checkTicket as jest.Mock).mockResolvedValue({
      ticket: '999999',
      stationCode: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-15',
      status: 'CHECKED',
      won: true,
      wins: [
        { prize: 'SPECIAL', prizeName: 'Giải Đặc biệt', amount: 2000000000 },
      ],
      totalAmount: 2000000000,
    });

    const { getByTestId, findByTestId } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    await findByTestId('station-chips-TPHCM');
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '999999');

    const submitBtn = await findByTestId('check-ticket-button');
    fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(haptics.success).toHaveBeenCalledTimes(1);
    });
  });

  it('displays localized Vietnamese error message when check fails (T09.24)', async () => {
    const { ApiError, API_ERROR_MESSAGES } = jest.requireActual('@/api/client');
    (apiCheck.checkTicket as jest.Mock).mockRejectedValue(
      new ApiError({
        status: 429,
        code: 'RATE_LIMITED',
        title: 'Too Many Requests',
        detail: 'Rate limit exceeded',
      }),
    );

    const { getByTestId, findByTestId, findByText } = await render(
      <CheckScreen />,
      { wrapper: createWrapper() },
    );

    await findByTestId('station-chips-TPHCM');
    fireEvent.changeText(getByTestId('ticket-input-digit-0'), '112233');

    const submitBtn = await findByTestId('check-ticket-button');
    fireEvent.press(submitBtn);

    expect(await findByText(API_ERROR_MESSAGES.RATE_LIMITED)).toBeTruthy();
  });
});
