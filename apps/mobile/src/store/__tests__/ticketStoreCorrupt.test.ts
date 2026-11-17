import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTickets,
  saveTicket,
  saveManyTickets,
  getTicketStoreHealth,
  resetTicketStoreForTests,
  TicketStoreCorruptError,
  TICKETS_STORAGE_KEY,
  CORRUPT_BACKUP_KEY_PREFIX,
} from '../ticketStore';

const input = {
  ticket: '012345',
  station: 'tp-hcm',
  stationName: 'TP. Hồ Chí Minh',
  drawDate: '2026-11-16',
  status: 'PENDING' as const,
  totalPrize: 0,
};

describe('ticketStore never overwrites after a failed read (T11.07)', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
    resetTicketStoreForTests();
  });

  it('corrupt JSON: save is refused and the original data is kept', async () => {
    const raw = '{"version":1,"tickets":[{"id":"x","ticket":"111111"'; // truncated
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, raw);

    await expect(saveTicket(input)).rejects.toBeInstanceOf(TicketStoreCorruptError);
    expect(await AsyncStorage.getItem(TICKETS_STORAGE_KEY)).toBe(raw);
  });

  it('corrupt JSON: keeps a backup copy of the raw string', async () => {
    const raw = 'not json at all';
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, raw);

    await getTickets();

    const keys = await AsyncStorage.getAllKeys();
    const backupKey = keys.find((k) => k.startsWith(CORRUPT_BACKUP_KEY_PREFIX));
    expect(backupKey).toBeDefined();
    expect(await AsyncStorage.getItem(backupKey!)).toBe(raw);
    expect(getTicketStoreHealth()).toEqual(
      expect.objectContaining({ state: 'corrupt', backupKey }),
    );
  });

  it('corrupt envelope shape (no tickets array) is treated as corrupt', async () => {
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, '{"version":1}');
    await expect(saveManyTickets([input])).rejects.toBeInstanceOf(TicketStoreCorruptError);
  });

  it('transient read error: retries once and keeps existing tickets', async () => {
    await saveTicket({ ...input, ticket: '222222' });
    resetTicketStoreForTests();

    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('busy'));

    await saveTicket(input);
    const all = await getTickets();
    expect(all.map((t) => t.ticket).sort()).toEqual(['012345', '222222']);
  });

  it('persistent read error: save is refused and nothing is written', async () => {
    await saveTicket({ ...input, ticket: '333333' });
    resetTicketStoreForTests();

    // First read + one retry both fail
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('io'))
      .mockRejectedValueOnce(new Error('io'));
    const setItem = jest.spyOn(AsyncStorage, 'setItem');
    setItem.mockClear();

    await expect(saveTicket(input)).rejects.toThrow();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('empty storage is fine to write', async () => {
    await saveTicket(input);
    expect(getTicketStoreHealth().state).toBe('ok');
  });
});
