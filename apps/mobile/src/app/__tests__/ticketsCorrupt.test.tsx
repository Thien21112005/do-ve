import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TicketsScreen from '../(tabs)/tickets';
import {
  getTickets,
  resetTicketStoreForTests,
  TICKETS_STORAGE_KEY,
} from '@/store/ticketStore';
import { STRINGS } from '@/lib/strings';

jest.mock('@/hooks', () => ({
  ...jest.requireActual('@/hooks'),
  usePendingTicketsRecheck: () => ({ isRechecking: false, refetchPending: jest.fn() }),
}));

describe('TicketsScreen corrupt storage banner (T11.07)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetTicketStoreForTests();
  });

  it('explains that data was kept and offers to export the copy', async () => {
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, '{broken');
    await getTickets();

    const { getByText } = await render(<TicketsScreen />);
    await waitFor(() => {
      expect(getByText(STRINGS.tickets.corruptTitle)).toBeTruthy();
      expect(getByText(STRINGS.tickets.corruptExport)).toBeTruthy();
    });
  });

  it('shows no banner when storage is healthy', async () => {
    const { queryByText } = await render(<TicketsScreen />);
    expect(queryByText(STRINGS.tickets.corruptTitle)).toBeNull();
  });
});
