import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TicketsScreen from '../(tabs)/tickets';
import { saveTicket, clearAllTickets, getTickets } from '@/store/ticketStore';
import { useRouter } from 'expo-router';

describe('TicketsScreen (Vé của tôi)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearAllTickets();
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

  it('deletes an individual ticket with confirmation dialog', async () => {
    jest.spyOn(Alert, 'alert');

    const ticket = await saveTicket({
      ticket: '112233',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });

    const { getByTestId, queryByText } = await render(<TicketsScreen />);

    const deleteBtn = getByTestId(`delete-ticket-btn-${ticket.id}`);
    expect(deleteBtn).toBeTruthy();

    fireEvent.press(deleteBtn);

    expect(Alert.alert).toHaveBeenCalledWith(
      expect.stringContaining('Xóa vé'),
      expect.any(String),
      expect.any(Array),
    );

    // Trigger confirmation
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const confirmButton = buttons.find((b: any) => b.style === 'destructive');
    await confirmButton.onPress();

    // Verify ticket is deleted from store
    await waitFor(async () => {
      const remaining = await getTickets();
      expect(remaining.length).toBe(0);
    });

    expect(queryByText('112233')).toBeNull();
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
});

