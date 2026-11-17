import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTicketsServerSnapshot,
  readTickets,
  loadTickets,
  saveTicket,
  resetTicketStoreForTests,
} from '../ticketStore';

describe('ticket store snapshots (T11.24)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetTicketStoreForTests();
  });

  it('server snapshot is one stable empty array (no infinite re-render on web/SSR)', () => {
    expect(getTicketsServerSnapshot()).toBe(getTicketsServerSnapshot());
    expect(getTicketsServerSnapshot()).toEqual([]);
  });

  it('readTickets() is a synchronous cache read; loadTickets() reads storage', async () => {
    expect(readTickets()).toEqual([]);
    await saveTicket({
      ticket: '012345',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-15',
      status: 'PENDING',
      totalPrize: 0,
    });
    resetTicketStoreForTests();
    expect(readTickets()).toEqual([]); // cache cleared, storage untouched
    const loaded = await loadTickets();
    expect(loaded.map((t) => t.ticket)).toEqual(['012345']);
    expect(readTickets()).toBe(loaded);
  });
});
