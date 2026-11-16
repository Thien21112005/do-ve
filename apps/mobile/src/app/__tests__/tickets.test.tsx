import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
import TicketsScreen, { resetSessionSavedTicketFilter } from '../(tabs)/tickets';
import {
  saveTicket,
  saveManyTickets,
  clearAllTickets,
  getTickets,
} from '@/store/ticketStore';
import { useRouter } from 'expo-router';

const mockRefetchPending = jest.fn();
jest.mock('@/hooks', () => {
  const actual = jest.requireActual('@/hooks');
  return {
    ...actual,
    usePendingTicketsRecheck: () => ({
      isRechecking: false,
      refetchPending: mockRefetchPending,
    }),
  };
});

describe('TicketsScreen (Vé của tôi)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearAllTickets();
    resetSessionSavedTicketFilter();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders friendly empty state when no tickets are saved', async () => {
    const { getByTestId, getByText } = await render(<TicketsScreen />);

    expect(getByTestId('saved-tickets-empty')).toBeTruthy();
    expect(getByText('Chưa có vé nào được lưu')).toBeTruthy();
    expect(getByTestId('tickets-empty-check-btn')).toBeTruthy();
    expect(getByTestId('tickets-privacy-notice')).toBeTruthy();
    expect(
      getByText('Vé chỉ lưu trên máy này, không gửi lên server.'),
    ).toBeTruthy();
  });

  it('navigates to check tab when pressing "Dò vé ngay" from empty state', async () => {
    const router = useRouter();
    const { getByTestId } = await render(<TicketsScreen />);

    const checkBtn = getByTestId('tickets-empty-check-btn');
    fireEvent.press(checkBtn);

    expect(router.push).toHaveBeenCalledWith('/(tabs)/check');
  });

  it('renders saved tickets list sorted newest first with date groups and status badges', async () => {
    // Seed two tickets with different dates and statuses
    await saveTicket({
      ticket: '012345',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 2000000000,
      createdAt: '2026-11-14T17:00:00Z',
    });

    await saveTicket({
      ticket: '654321',
      station: 'BD',
      stationName: 'Bình Dương',
      drawDate: '2026-11-13',
      status: 'LOST',
      totalPrize: 0,
      createdAt: '2026-11-13T17:00:00Z',
    });

    await saveTicket({
      ticket: '888999',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
      createdAt: '2026-11-14T17:30:00Z',
    });

    const { getByTestId, getByText, getAllByText, queryByTestId } =
      await render(<TicketsScreen />);

    // Empty state should NOT be visible
    expect(queryByTestId('saved-tickets-empty')).toBeNull();

    // List should be visible
    expect(getByTestId('saved-tickets-list')).toBeTruthy();

    // Verify tickets are rendered with preserved leading zero
    expect(getByText('012345')).toBeTruthy();
    expect(getByText('654321')).toBeTruthy();
    expect(getByText('888999')).toBeTruthy();

    // Verify station names
    expect(getAllByText(/TP. Hồ Chí Minh/).length).toBe(2);
    expect(getByText(/Bình Dương/)).toBeTruthy();

    // Verify winning amount
    expect(getAllByText(/2.000.000.000 đ/).length).toBeGreaterThanOrEqual(1);
  });

  it('deletes an individual ticket via swipe with undo snackbar (T10.47)', async () => {
    const ticket = await saveTicket({
      ticket: '112233',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });

    const { getByTestId, getByText, queryByText } = await render(
      <TicketsScreen />,
    );

    // Verify swipe action delete button exists with proper a11y label
    const swipeDeleteBtn = getByTestId(`swipe-delete-btn-${ticket.id}`);
    expect(swipeDeleteBtn).toBeTruthy();
    expect(swipeDeleteBtn.props.accessibilityLabel).toContain('112233');

    // Trigger swipe delete
    fireEvent.press(swipeDeleteBtn);

    // Verify ticket is removed from view and store
    await waitFor(async () => {
      expect(queryByText('112233')).toBeNull();
      const remaining = await getTickets();
      expect(remaining.length).toBe(0);
    });

    // Verify Undo snackbar appears
    expect(getByTestId('undo-delete-snackbar')).toBeTruthy();
    expect(getByText(/Đã xóa vé 112233/)).toBeTruthy();
    const undoBtn = getByTestId('undo-delete-btn');
    expect(undoBtn).toBeTruthy();

    // Press Undo
    fireEvent.press(undoBtn);

    // Verify ticket is restored in view and storage
    await waitFor(async () => {
      expect(getByText('112233')).toBeTruthy();
      const restored = await getTickets();
      expect(restored.length).toBe(1);
      expect(restored[0].ticket).toBe('112233');
    });

    // Verify snackbar disappears after undo
    await waitFor(() => {
      expect(queryByText(/Đã xóa vé 112233/)).toBeNull();
    });
  });

  it('clears all tickets when pressing "Xóa tất cả" and confirming', async () => {
    jest.spyOn(Alert, 'alert');

    await saveTicket({
      ticket: '111111',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });
    await saveTicket({
      ticket: '222222',
      station: 'BD',
      stationName: 'Bình Dương',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });

    const { getByTestId } = await render(<TicketsScreen />);

    const clearAllBtn = getByTestId('clear-all-tickets-btn');
    expect(clearAllBtn).toBeTruthy();

    fireEvent.press(clearAllBtn);

    expect(Alert.alert).toHaveBeenCalledWith(
      expect.stringContaining('Xóa tất cả'),
      expect.any(String),
      expect.any(Array),
    );

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const confirmButton = buttons.find((b: any) => b.style === 'destructive');
    await confirmButton.onPress();

    await waitFor(async () => {
      const remaining = await getTickets();
      expect(remaining.length).toBe(0);
    });

    expect(getByTestId('saved-tickets-empty')).toBeTruthy();
  });

  it('supports pull-to-refresh on saved tickets list (T09.45)', async () => {
    await saveTicket({
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    const { getByTestId } = await render(<TicketsScreen />);
    const list = getByTestId('saved-tickets-list');
    expect(list.props.refreshControl).toBeTruthy();
    expect(list.props.refreshControl.props.refreshing).toBe(false);
    expect(typeof list.props.refreshControl.props.onRefresh).toBe('function');
  });

  it('renders summary header with 3 stats (total, pending, won) and filters list on tap (T10.44)', async () => {
    await saveTicket({
      ticket: '012345',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 2000000000,
    });
    await saveTicket({
      ticket: '654321',
      station: 'BD',
      stationName: 'Bình Dương',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });
    await saveTicket({
      ticket: '888999',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    const { getByTestId, getByText, queryByText } = await render(<TicketsScreen />);

    // Verify summary card presence
    expect(getByTestId('saved-tickets-summary')).toBeTruthy();
    expect(getByTestId('summary-stat-total')).toBeTruthy();
    expect(getByTestId('summary-stat-pending')).toBeTruthy();
    expect(getByTestId('summary-stat-won')).toBeTruthy();

    // Verify summary numbers
    expect(within(getByTestId('summary-stat-total')).getByText('3')).toBeTruthy();
    expect(within(getByTestId('summary-stat-pending')).getByText('1')).toBeTruthy();
    expect(
      within(getByTestId('summary-stat-won')).getByText('2.000.000.000 đ'),
    ).toBeTruthy();

    // Initially all 3 tickets are displayed
    expect(getByText('012345')).toBeTruthy();
    expect(getByText('654321')).toBeTruthy();
    expect(getByText('888999')).toBeTruthy();

    // Tap "Đang chờ" stat to filter by pending
    fireEvent.press(getByTestId('summary-stat-pending'));
    await waitFor(() => {
      expect(getByText('888999')).toBeTruthy();
      expect(queryByText('012345')).toBeNull();
      expect(queryByText('654321')).toBeNull();
    });

    // Tap "Tiền trúng" stat to filter by won
    fireEvent.press(getByTestId('summary-stat-won'));
    await waitFor(() => {
      expect(getByText('012345')).toBeTruthy();
      expect(queryByText('888999')).toBeNull();
      expect(queryByText('654321')).toBeNull();
    });

    // Tap "Tổng vé" stat to reset to all
    fireEvent.press(getByTestId('summary-stat-total'));
    await waitFor(() => {
      expect(getByText('012345')).toBeTruthy();
      expect(getByText('654321')).toBeTruthy();
      expect(getByText('888999')).toBeTruthy();
    });
  });

  it('filters saved tickets using status filter chips (All, Won, Pending, Lost) and remembers choice (T10.45)', async () => {
    await saveTicket({
      ticket: '111111',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });
    await saveTicket({
      ticket: '222222',
      station: 'BD',
      stationName: 'Bình Dương',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });
    await saveTicket({
      ticket: '333333',
      station: 'TN',
      stationName: 'Tây Ninh',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });
    await saveTicket({
      ticket: '444444',
      station: 'AG',
      stationName: 'An Giang',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });

    const { getByTestId, getByText, queryByText } = await render(
      <TicketsScreen />,
    );

    // Verify chips presence
    expect(getByTestId('tickets-filter-chips')).toBeTruthy();
    expect(getByTestId('ticket-filter-chip-ALL')).toBeTruthy();
    expect(getByTestId('ticket-filter-chip-WON')).toBeTruthy();
    expect(getByTestId('ticket-filter-chip-PENDING')).toBeTruthy();
    expect(getByTestId('ticket-filter-chip-LOST')).toBeTruthy();

    // Initially all 4 tickets are visible
    expect(getByText('111111')).toBeTruthy();
    expect(getByText('222222')).toBeTruthy();
    expect(getByText('333333')).toBeTruthy();
    expect(getByText('444444')).toBeTruthy();

    // 1. Filter LOST (Không trúng)
    fireEvent.press(getByTestId('ticket-filter-chip-LOST'));
    await waitFor(() => {
      expect(getByText('333333')).toBeTruthy();
      expect(getByText('444444')).toBeTruthy();
      expect(queryByText('111111')).toBeNull();
      expect(queryByText('222222')).toBeNull();
    });

    // 2. Filter WON (Trúng thưởng)
    fireEvent.press(getByTestId('ticket-filter-chip-WON'));
    await waitFor(() => {
      expect(getByText('111111')).toBeTruthy();
      expect(queryByText('222222')).toBeNull();
      expect(queryByText('333333')).toBeNull();
      expect(queryByText('444444')).toBeNull();
    });

    // 3. Filter PENDING (Chờ kết quả)
    fireEvent.press(getByTestId('ticket-filter-chip-PENDING'));
    await waitFor(() => {
      expect(getByText('222222')).toBeTruthy();
      expect(queryByText('111111')).toBeNull();
      expect(queryByText('333333')).toBeNull();
      expect(queryByText('444444')).toBeNull();
    });

    // 4. Reset back to ALL
    fireEvent.press(getByTestId('ticket-filter-chip-ALL'));
    await waitFor(() => {
      expect(getByText('111111')).toBeTruthy();
      expect(getByText('222222')).toBeTruthy();
      expect(getByText('333333')).toBeTruthy();
      expect(getByText('444444')).toBeTruthy();
    });
  });

  it('remembers active filter choice across screen mounts in the same session (T10.45)', async () => {
    await saveTicket({
      ticket: '111111',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });
    await saveTicket({
      ticket: '222222',
      station: 'BD',
      stationName: 'Bình Dương',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    // First mount: set filter to PENDING
    const screen1 = await render(<TicketsScreen />);
    fireEvent.press(screen1.getByTestId('ticket-filter-chip-PENDING'));
    await waitFor(() => {
      expect(screen1.getByText('222222')).toBeTruthy();
    });
    screen1.unmount();
    await new Promise((r) => setTimeout(r, 50));

    // Second mount in same session: initial state should be PENDING
    const screen2 = await render(<TicketsScreen />);
    await waitFor(() => {
      expect(screen2.getByText('222222')).toBeTruthy();
      expect(screen2.queryByText('111111')).toBeNull();
    });

    screen2.unmount();
    await new Promise((r) => setTimeout(r, 50));
  });

  it('renders compact ticket rows grouped by sticky date section headers (T10.46)', async () => {
    // Seed 7 tickets spanning 2 draw dates (4 on 2026-11-14, 3 on 2026-11-13)
    const ticketsData = [
      {
        ticket: '100001',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'WON' as const,
        totalPrize: 100000,
      },
      {
        ticket: '100002',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'LOST' as const,
        totalPrize: 0,
      },
      {
        ticket: '100003',
        station: 'BD',
        stationName: 'Bình Dương',
        drawDate: '2026-11-14',
        status: 'PENDING' as const,
        totalPrize: 0,
      },
      {
        ticket: '100004',
        station: 'BD',
        stationName: 'Bình Dương',
        drawDate: '2026-11-14',
        status: 'LOST' as const,
        totalPrize: 0,
      },
      {
        ticket: '200001',
        station: 'TG',
        stationName: 'Tiền Giang',
        drawDate: '2026-11-13',
        status: 'WON' as const,
        totalPrize: 2000000,
      },
      {
        ticket: '200002',
        station: 'TG',
        stationName: 'Tiền Giang',
        drawDate: '2026-11-13',
        status: 'LOST' as const,
        totalPrize: 0,
      },
      {
        ticket: '200003',
        station: 'KG',
        stationName: 'Kiên Giang',
        drawDate: '2026-11-13',
        status: 'PENDING' as const,
        totalPrize: 0,
      },
    ];

    await saveManyTickets(ticketsData);

    const { getByTestId, getByText } = await render(<TicketsScreen />);

    // Verify list presence after async storage loads
    await waitFor(() => {
      expect(getByTestId('saved-tickets-list')).toBeTruthy();
      expect(getByTestId('section-header-2026-11-14')).toBeTruthy();
      expect(getByTestId('section-header-2026-11-13')).toBeTruthy();
    });

    expect(getByText(/14\/11\/2026/)).toBeTruthy();
    expect(getByText(/13\/11\/2026/)).toBeTruthy();

    // Verify all 7 compact ticket rows are rendered
    for (const t of ticketsData) {
      expect(getByText(t.ticket)).toBeTruthy();
      expect(
        getByTestId(`saved-ticket-item-${t.station}_${t.drawDate}_${t.ticket}`),
      ).toBeTruthy();
    }
  });

  it('opens ticket detail sheet with note editing, navigation and delete actions (T10.48)', async () => {
    const router = useRouter();

    const ticket = await saveTicket({
      ticket: '998877',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
      note: 'Vé chú Bảy tặng',
    });

    const { getByTestId, queryByTestId } = await render(
      <TicketsScreen />,
    );

    await waitFor(() => {
      expect(getByTestId('saved-tickets-list')).toBeTruthy();
    });

    // 1. Press row to open detail sheet
    const row = getByTestId(`saved-ticket-item-${ticket.id}`);
    fireEvent.press(row);

    // Verify detail sheet is visible
    await waitFor(() => {
      expect(getByTestId('saved-ticket-detail-sheet')).toBeTruthy();
    });
    const sheet = getByTestId('saved-ticket-detail-sheet');
    expect(getByTestId('detail-sheet-ticket-number')).toBeTruthy();
    expect(getByTestId('detail-sheet-ticket-number').props.children).toBe('998877');
    expect(within(sheet).getByText(/TP. Hồ Chí Minh/)).toBeTruthy();
    expect(within(sheet).getByText(/14\/11\/2026/)).toBeTruthy();

    // Verify existing note is displayed
    const noteInput = getByTestId('detail-sheet-note-input');
    expect(noteInput.props.value).toBe('Vé chú Bảy tặng');

    // 2. Edit note and save
    fireEvent.changeText(noteInput, 'Vé trúng thưởng giải 8');
    await waitFor(() => {
      expect(noteInput.props.value).toBe('Vé trúng thưởng giải 8');
    });
    fireEvent.press(getByTestId('detail-sheet-save-note-btn'));

    // Wait for note update in storage
    await waitFor(async () => {
      const tickets = await getTickets();
      const updated = tickets.find((t) => t.id === ticket.id);
      expect(updated?.note).toBe('Vé trúng thưởng giải 8');
    });

    // 3. Navigation: "Xem bảng kết quả kỳ này"
    fireEvent.press(getByTestId('detail-sheet-view-draw-btn'));
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining('/(tabs)/results'),
    );

    // 4. Navigation: "Dò lại vé này"
    fireEvent.press(getByTestId('detail-sheet-recheck-btn'));
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining('/(tabs)/check'),
    );

    // 5. Close sheet button
    fireEvent.press(getByTestId('detail-sheet-close-btn'));
    await waitFor(() => {
      expect(queryByTestId('saved-ticket-detail-sheet')).toBeNull();
    });
  });
});

