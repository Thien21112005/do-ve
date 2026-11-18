import React from 'react';
import { Dimensions, PixelRatio } from 'react-native';
import {
  render,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from '@/app/(tabs)/index';
import CheckScreen from '@/app/(tabs)/check';
import ResultsScreen from '@/app/(tabs)/results';
import TicketsScreen, { resetSessionSavedTicketFilter } from '@/app/(tabs)/tickets';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/tokens';
import { clearAllTickets, readTickets } from '@/store/ticketStore';
import { updateSettings, resetSettings } from '@/store/settings';
import * as api from '@/api';

jest.mock('@/api', () => {
  const actual = jest.requireActual('@/api');
  return {
    ...actual,
    fetchScheduleByDate: jest.fn(),
    fetchLatestDayDraws: jest.fn(),
    fetchDraw: jest.fn(),
    checkTicket: jest.fn(),
  };
});

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'MatrixQueryWrapper';
  return Wrapper;
}

function assertNoAccessibleAncestor(node: any) {
  let parent = node?.parent;
  while (parent) {
    expect(parent.props?.accessible).not.toBe(true);
    parent = parent.parent;
  }
}

function srgbChannelToLinear(c8: number): number {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Device, Font-Scale, Sunlight Contrast & Screen-Reader Matrix (T11.51)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    resetSettings();
    updateSettings({ autoSubmitEnabled: false });
    await clearAllTickets();
    resetSessionSavedTicketFilter();

    (api.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      { code: 'tp-hcm', name: 'TP. Hồ Chí Minh', region: 'SOUTH' },
      { code: 'dong-thap', name: 'Đồng Tháp', region: 'SOUTH' },
      { code: 'ca-mau', name: 'Cà Mau', region: 'SOUTH' },
    ]);
    (api.fetchLatestDayDraws as jest.Mock).mockResolvedValue([
      {
        stationCode: 'tp-hcm',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-17',
        isComplete: true,
        numbers: {
          EIGHTH: ['43'],
          SEVENTH: ['303'],
          SIXTH: ['1832', '5501', '0973'],
          FIFTH: ['6620'],
          FOURTH: ['04512', '77810', '31904', '62845', '19023', '84511', '50298'],
          THIRD: ['11029', '58011'],
          SECOND: ['90015'],
          FIRST: ['38274'],
          SPECIAL: ['045123'],
        },
      },
    ]);
    (api.fetchDraw as jest.Mock).mockResolvedValue({
      stationCode: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-17',
      isComplete: true,
      numbers: {
        EIGHTH: ['43'],
        SEVENTH: ['303'],
        SIXTH: ['1832', '5501', '0973'],
        FIFTH: ['6620'],
        FOURTH: ['04512', '77810', '31904', '62845', '19023', '84511', '50298'],
        THIRD: ['11029', '58011'],
        SECOND: ['90015'],
        FIRST: ['38274'],
        SPECIAL: ['045123'],
      },
    });
    (api.checkTicket as jest.Mock).mockResolvedValue({
      status: 'CHECKED',
      ticket: '045123',
      stationCode: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-17',
      won: true,
      totalAmount: 2000000000,
      wins: [
        {
          tier: 'SPECIAL',
          matchedNumber: '045123',
          prizeAmount: 2000000000,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('walks the complete TalkBack / VoiceOver ticket-checking and saving journey without accessible-ancestor traps', async () => {
    const Wrapper = createQueryWrapper();
    const checkView = await render(<CheckScreen />, { wrapper: Wrapper });

    // 1. Screen-reader finds context header and station chip
    expect(checkView.getAllByRole('header').length).toBeGreaterThanOrEqual(1);
    const stationChip = await checkView.findByLabelText('Đài TP. Hồ Chí Minh');
    assertNoAccessibleAncestor(stationChip);
    await fireEvent.press(stationChip);

    // 2. Screen-reader enters 6 digits (preserving leading zero 045123)
    const digits = ['0', '4', '5', '1', '2', '3'];
    for (let i = 0; i < digits.length; i++) {
      const box = checkView.getByLabelText(`Chữ số thứ ${i + 1}`);
      assertNoAccessibleAncestor(box);
      await fireEvent.changeText(box, digits[i]);
    }

    // 3. Screen-reader activates primary Check CTA
    const submitBtn = checkView.getByTestId('check-ticket-button');
    expect(submitBtn.props.accessibilityRole).toBe('button');
    expect(submitBtn.props.accessibilityState.disabled).toBe(false);
    assertNoAccessibleAncestor(submitBtn);
    await fireEvent.press(submitBtn);

    // 4. ResultStub announces win via summary + assertive liveRegion, and Save button is independently focusable
    const summaryEl = await checkView.findByTestId('check-result-section');
    expect(summaryEl.props.accessibilityRole).toBe('summary');
    expect(summaryEl.props.accessibilityLiveRegion).toBe('assertive');
    expect(summaryEl.props.accessibilityLabel).toContain('Chúc mừng');
    expect(checkView.getByText('Hai tỷ đồng')).toBeTruthy();

    const saveBtn = checkView.getByTestId('result-card-save-btn');
    assertNoAccessibleAncestor(saveBtn);
    await fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(readTickets()).toHaveLength(1);
      expect(readTickets()[0].ticket).toBe('045123');
    });

    await checkView.unmount();

    // 5. Screen-reader opens TicketsScreen, inspects detail sheet, deletes, and undoes via Snackbar
    const ticketsView = await render(<TicketsScreen />, { wrapper: Wrapper });
    const savedRow = await ticketsView.findByLabelText(/Chi tiết vé 045123/);
    assertNoAccessibleAncestor(savedRow);
    await fireEvent.press(savedRow);

    const viewDrawBtn = await ticketsView.findByLabelText('Xem bảng kết quả kỳ này');
    assertNoAccessibleAncestor(viewDrawBtn);

    const deleteInSheetBtn = ticketsView.getByLabelText('Xóa vé này');
    assertNoAccessibleAncestor(deleteInSheetBtn);
    await fireEvent.press(deleteInSheetBtn);

    await waitFor(() => {
      expect(readTickets()).toHaveLength(0);
    });

    const undoBtn = await ticketsView.findByTestId('undo-delete-btn');
    assertNoAccessibleAncestor(undoBtn);
    await fireEvent.press(undoBtn);

    await waitFor(() => {
      expect(readTickets()).toHaveLength(1);
      expect(readTickets()[0].ticket).toBe('045123');
    });
  });

  it('switches TicketInput to single wide box on small 360x640 screen at 200% font scale', async () => {
    const dimSpy = jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 360,
      height: 640,
      scale: 2,
      fontScale: 2,
    });
    const fontSpy = jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(2);

    try {
      const Wrapper = createQueryWrapper();
      const { getByTestId, queryByLabelText } = await render(<CheckScreen />, {
        wrapper: Wrapper,
      });

      expect(getByTestId('ticket-input-single-input')).toBeTruthy();
      expect(queryByLabelText('Chữ số thứ 1')).toBeNull();

      const homeView = await render(<HomeScreen />, { wrapper: Wrapper });
      expect(homeView.getByTestId('home-ticket-input-single-input')).toBeTruthy();
    } finally {
      dimSpy.mockRestore();
      fontSpy.mockRestore();
    }
  });

  it('constrains readable maxWidth on large 768x1024 tablet viewport', async () => {
    const dimSpy = jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 768,
      height: 1024,
      scale: 2,
      fontScale: 1,
    });

    try {
      const Wrapper = createQueryWrapper();
      const homeView = await render(<HomeScreen />, { wrapper: Wrapper });
      const homeScroll = homeView.getByTestId('home-scroll-view');
      expect(homeScroll.props.contentContainerStyle).toEqual(
        expect.objectContaining({
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }),
      );

      const resultsView = await render(<ResultsScreen />, { wrapper: Wrapper });
      const resultsScroll = resultsView.getByTestId('results-scroll-view');
      expect(resultsScroll.props.contentContainerStyle).toEqual(
        expect.objectContaining({
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }),
      );
    } finally {
      dimSpy.mockRestore();
    }
  });

  it('maintains WCAG AA / AAA contrast ratios across light and dark palettes for outdoor sunlight legibility', () => {
    // Light theme (sunlight critical)
    expect(contrastRatio(colors.light.textMain, colors.light.background)).toBeGreaterThanOrEqual(12);
    expect(contrastRatio(colors.light.textMain, colors.light.surface)).toBeGreaterThanOrEqual(14);
    expect(contrastRatio(colors.light.onPrimary, colors.light.primary)).toBeGreaterThanOrEqual(12);
    expect(contrastRatio(colors.light.textMuted, colors.light.background)).toBeGreaterThanOrEqual(5);
    expect(contrastRatio(colors.light.special, colors.light.surface)).toBeGreaterThanOrEqual(6);
    expect(contrastRatio(colors.light.special, colors.light.specialTint)).toBeGreaterThanOrEqual(5.5);
    expect(contrastRatio(colors.light.win, colors.light.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.light.win, colors.light.winTint)).toBeGreaterThanOrEqual(4.5);

    // Dark theme
    expect(contrastRatio(colors.dark.textMain, colors.dark.background)).toBeGreaterThanOrEqual(14);
    expect(contrastRatio(colors.dark.textMain, colors.dark.surface)).toBeGreaterThanOrEqual(12);
    expect(contrastRatio(colors.dark.onPrimary, colors.dark.primary)).toBeGreaterThanOrEqual(12);
    expect(contrastRatio(colors.dark.textMuted, colors.dark.background)).toBeGreaterThanOrEqual(6);
    expect(contrastRatio(colors.dark.special, colors.dark.surface)).toBeGreaterThanOrEqual(6);
    expect(contrastRatio(colors.dark.win, colors.dark.surface)).toBeGreaterThanOrEqual(7);
  });
});
