import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTickets,
  saveTicket,
  removeTicket,
  clearAllTickets,
  updateTicket,
  getTicketById,
  TICKETS_STORAGE_KEY,
} from '../ticketStore';

describe('ticketStore Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('returns empty array when storage is empty', async () => {
    const tickets = await getTickets();
    expect(tickets).toEqual([]);
  });

  it('saves a ticket, preserves leading zeros, and retrieves it', async () => {
    const saved = await saveTicket({
      ticket: '012345',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 2000000,
      wins: [
        {
          tier: 'FOURTH',
          prizeAmount: 2000000,
          matchedNumber: '12345',
        },
      ],
    });

    expect(saved.ticket).toBe('012345');
    expect(saved.id).toBe('TPHCM_2026-11-14_012345');
    expect(saved.createdAt).toBeDefined();

    const all = await getTickets();
    expect(all).toHaveLength(1);
    expect(all[0].ticket).toBe('012345');
    expect(all[0].status).toBe('WON');
    expect(all[0].totalPrize).toBe(2000000);
  });

  it('updates existing ticket without duplicating when saved with same id', async () => {
    await saveTicket({
      ticket: '654321',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    const before = await getTickets();
    expect(before).toHaveLength(1);
    expect(before[0].status).toBe('PENDING');

    // Update the same ticket to WON
    await saveTicket({
      ticket: '654321',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });

    const after = await getTickets();
    expect(after).toHaveLength(1);
    expect(after[0].status).toBe('WON');
    expect(after[0].totalPrize).toBe(100000);
  });

  it('removes ticket by id', async () => {
    const t1 = await saveTicket({
      ticket: '111111',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });

    const t2 = await saveTicket({
      ticket: '222222',
      station: 'DONG_NAI',
      stationName: 'Đồng Nai',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });

    expect(await getTickets()).toHaveLength(2);

    const result = await removeTicket(t1.id);
    expect(result).toBe(true);

    const remaining = await getTickets();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(t2.id);
  });

  it('clears all tickets', async () => {
    await saveTicket({
      ticket: '111111',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'LOST',
      totalPrize: 0,
    });

    await saveTicket({
      ticket: '222222',
      station: 'DONG_NAI',
      stationName: 'Đồng Nai',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 100000,
    });

    expect(await getTickets()).toHaveLength(2);

    await clearAllTickets();
    expect(await getTickets()).toEqual([]);
  });

  it('updates ticket fields using updateTicket', async () => {
    const ticket = await saveTicket({
      ticket: '777888',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    const updated = await updateTicket(ticket.id, {
      status: 'WON',
      totalPrize: 5000000,
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('WON');
    expect(updated?.totalPrize).toBe(5000000);

    const fetched = await getTicketById(ticket.id);
    expect(fetched?.status).toBe('WON');
  });

  it('gracefully handles corrupted JSON in storage by returning empty array', async () => {
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, '{ invalid corrupted json :::');

    const tickets = await getTickets();
    expect(tickets).toEqual([]);
  });

  it('gracefully handles storage read error without throwing', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage failure'));

    const tickets = await getTickets();
    expect(tickets).toEqual([]);
  });

  it('gracefully handles storage write failure in saveTicket', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Disk full'));

    const saved = await saveTicket({
      ticket: '999999',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    expect(saved).toBeDefined();
    expect(saved.ticket).toBe('999999');
  });
});

