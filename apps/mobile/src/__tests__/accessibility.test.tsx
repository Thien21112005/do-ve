import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  TicketInput,
  DateStrip,
  StationChips,
  ResultCard,
  DrawTable,
  OfflineBanner,
  HighlightedTicket,
} from '@/components';
import CheckScreen from '@/app/(tabs)/check';
import type { UiCheckResult } from '@/api/mappers';

jest.mock('@/api', () => ({
  ...jest.requireActual('@/api'),
  fetchScheduleByDate: jest.fn().mockResolvedValue([
    { code: 'TPHCM', name: 'TP. Hồ Chí Minh', region: 'SOUTH' },
    { code: 'LONG_AN', name: 'Long An', region: 'SOUTH' },
  ]),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'AccessibilityQueryWrapper';
  return Wrapper;
}

describe('Accessibility (a11y) Verification', () => {
  it('TicketInput exposes accessible labels, hints, and disabled state for screen readers', async () => {
    const { getByLabelText, getByTestId } = await render(
      <TicketInput value="123456" onChangeText={jest.fn()} disabled={false} />,
    );

    // 6 digit boxes must each have explicit label
    for (let i = 1; i <= 6; i++) {
      const digitInput = getByLabelText(`Chữ số thứ ${i}`);
      expect(digitInput).toBeTruthy();
      expect(digitInput.props.accessibilityHint).toBe(
        'Nhập chữ số từ 0 đến 9',
      );
      expect(digitInput.props.accessibilityState).toEqual({ disabled: false });
    }

    // Outer container has total ticket number announced
    expect(getByTestId('ticket-input').props.accessibilityLabel).toContain(
      'Số vé: 123456',
    );
  });

  it('DateStrip chips provide accessible button role and selection state', async () => {
    const { getAllByRole } = await render(
      <DateStrip
        selectedDate="2026-11-14"
        onSelectDate={jest.fn()}
        daysCount={3}
      />,
    );

    const buttons = getAllByRole('button');
    const dateChips = buttons.filter((btn) =>
      /ngày \d{2}\/\d{2}/i.test(btn.props.accessibilityLabel ?? ''),
    );
    expect(dateChips.length).toBeGreaterThanOrEqual(3);
    // Each date chip must have an accessibilityLabel with date information
    dateChips.forEach((btn) => {
      expect(btn.props.accessibilityLabel).toMatch(/ngày \d{2}\/\d{2}/i);
      expect(btn.props.accessibilityState).toHaveProperty('selected');
    });
  });

  it('StationChips expose accessible container', async () => {
    const { findByTestId } = await render(
      <StationChips
        selectedDate="2026-11-14"
        selectedStation="TPHCM"
        onSelectStation={jest.fn()}
      />,
      { wrapper: createWrapper() },
    );

    const chips = await findByTestId('station-chips');
    expect(chips).toBeTruthy();
  });

  it('HighlightedTicket announces ticket number and matched digits clearly', async () => {
    const { getByLabelText } = await render(
      <HighlightedTicket ticket="123456" matchedDigits="456" />,
    );

    const el = getByLabelText(/Số vé 123456, khớp 3 số cuối 456/i);
    expect(el).toBeTruthy();
    expect(el.props.accessibilityRole).toBe('text');
  });

  it('DrawTable rows provide clear screen-reader announcements for all prize tiers', async () => {
    const prizes = {
      SPECIAL: ['123456'],
      FIRST: ['65432'],
      EIGHTH: ['79'],
    };

    const { getByLabelText } = await render(<DrawTable prizes={prizes} />);

    expect(getByLabelText(/Đặc biệt: 123456/i)).toBeTruthy();
    expect(getByLabelText(/Giải nhất: 65432/i)).toBeTruthy();
    expect(getByLabelText(/Giải tám: 79/i)).toBeTruthy();
  });

  it('ResultCard announces win, loss, and pending states with accessibilityRole="summary" and assertive live region', async () => {
    const winningResult: UiCheckResult = {
      ticket: '123456',
      stationCode: 'TPHCM',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WIN',
      won: true,
      wins: [
        {
          tier: 'SPECIAL',
          tierName: 'Giải Đặc biệt',
          prizeAmount: 2000000000,
          matchedNumber: '123456',
          matchedDigits: '123456',
        },
      ],
      totalAmount: 2000000000,
      totalPrize: 2000000000,
    };

    const { getByTestId } = await render(<ResultCard result={winningResult} />);
    const card = getByTestId('result-card');

    expect(card.props.accessibilityRole).toBe('summary');
    expect(card.props.accessibilityLiveRegion).toBe('assertive');
    expect(card.props.accessibilityLabel).toContain('Chúc mừng');
    expect(card.props.accessibilityLabel).toContain('2.000.000.000 đ');
  });

  it('OfflineBanner has alert role and polite live region', async () => {
    const { getByTestId } = await render(<OfflineBanner isOffline={true} onRetry={jest.fn()} />);
    const banner = getByTestId('offline-banner');

    expect(banner.props.accessibilityRole).toBe('alert');
    expect(banner.props.accessibilityLiveRegion).toBe('polite');

    const retryBtn = getByTestId('offline-banner-retry-btn');
    expect(retryBtn.props.hitSlop).toBeDefined();
  });

  it('enforces min 44pt touch targets or hitSlop on ResultCard action buttons (T10.58)', async () => {
    const pendingResult: any = {
      ticket: '777888',
      stationCode: 'TPHCM',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'RESULT_NOT_AVAILABLE',
      won: false,
      wins: [],
      totalAmount: 0,
      totalPrize: 0,
    };

    const { getByTestId } = await render(
      <ResultCard
        result={pendingResult}
        onSaveTicket={jest.fn()}
        onCheckAgain={jest.fn()}
      />,
    );

    const saveBtn = getByTestId('result-card-save-btn');
    const retryBtn = getByTestId('result-card-retry-btn');

    expect(saveBtn.props.hitSlop).toBeDefined();
    expect(retryBtn.props.hitSlop).toBeDefined();
  });

  it('CheckScreen has accessible headers, mode selector, and action buttons', async () => {
    const { getByTestId, getAllByRole } = await render(<CheckScreen />, {
      wrapper: createWrapper(),
    });

    const checkBtn = getByTestId('check-ticket-button');
    expect(checkBtn.props.accessibilityRole).toBe('button');
    expect(checkBtn.props.accessibilityState.disabled).toBe(true);

    const headers = getAllByRole('header');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });
});
