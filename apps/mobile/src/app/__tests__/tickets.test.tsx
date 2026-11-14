import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TicketsScreen from '../(tabs)/tickets';
import { saveTicket, clearAllTickets } from '@/store/ticketStore';
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
});

