import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CURRENT_SCHEMA_VERSION,
  TICKETS_STORAGE_KEY,
  getTickets,
  normalizeStationCode,
  resetTicketStoreForTests,
  saveManyTickets,
  saveTicket,
} from '../ticketStore';

describe('station code normalization & v2 migration (T11.17)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    resetTicketStoreForTests();
  });

  it('normalizes legacy uppercase, compact and shorthand codes to backend slugs', () => {
    expect(normalizeStationCode('TPHCM')).toBe('tp-hcm');
    expect(normalizeStationCode('tphcm')).toBe('tp-hcm');
    expect(normalizeStationCode('TP.HCM')).toBe('tp-hcm');
    expect(normalizeStationCode('tp-hcm')).toBe('tp-hcm');
    expect(normalizeStationCode('DONG_THAP')).toBe('dong-thap');
    expect(normalizeStationCode('dongthap')).toBe('dong-thap');
    expect(normalizeStationCode('DA_LAT')).toBe('da-lat');
    expect(normalizeStationCode('dalat')).toBe('da-lat');
    expect(normalizeStationCode('BD')).toBe('binh-duong');
    expect(normalizeStationCode('TG')).toBe('tien-giang');
    expect(normalizeStationCode('KG')).toBe('kien-giang');
  });

  it('dedupes saveTicket and saveManyTickets across TPHCM / tphcm / tp-hcm', async () => {
    await saveTicket({
      ticket: '012345',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'PENDING',
      totalPrize: 0,
    });

    await saveTicket({
      ticket: '012345',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WON',
      totalPrize: 200000,
    });

    const afterSingle = await getTickets();
    expect(afterSingle).toHaveLength(1);
    expect(afterSingle[0].id).toBe('tp-hcm_2026-11-14_012345');
    expect(afterSingle[0].station).toBe('tp-hcm');
    expect(afterSingle[0].status).toBe('WON');
    expect(afterSingle[0].totalPrize).toBe(200000);

    await saveManyTickets([
      {
        ticket: '999888',
        station: 'DONG_NAI',
        stationName: 'Đồng Nai',
        drawDate: '2026-11-14',
        status: 'PENDING',
        totalPrize: 0,
      },
      {
        ticket: '999888',
        station: 'dong-nai',
        stationName: 'Đồng Nai',
        drawDate: '2026-11-14',
        status: 'LOST',
        totalPrize: 0,
      },
    ]);

    const afterBatch = await getTickets();
    const dn = afterBatch.filter((t) => t.ticket === '999888');
    expect(dn).toHaveLength(1);
    expect(dn[0].station).toBe('dong-nai');
    expect(dn[0].status).toBe('LOST');
  });

  it('migrates v1 envelopes once, merging duplicates and keeping settled results and notes', async () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(2);

    const v1Payload = {
      version: 1,
      tickets: [
        {
          id: 'TPHCM_2026-11-14_012345',
          ticket: '012345',
          station: 'TPHCM',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-14',
          status: 'PENDING',
          totalPrize: 0,
          note: 'Mua ở chợ Bến Thành',
          createdAt: '2026-11-14T08:00:00Z',
        },
        {
          id: 'tp-hcm_2026-11-14_012345',
          ticket: '012345',
          station: 'tp-hcm',
          stationName: 'tp-hcm',
          drawDate: '2026-11-14',
          status: 'WON',
          totalPrize: 200000,
          wins: [{ tier: 'FIFTH', prizeAmount: 200000, matchedNumber: '2345' }],
          createdAt: '2026-11-14T17:00:00Z',
        },
        {
          id: 'DONG_THAP_2026-11-14_654321',
          ticket: '654321',
          station: 'DONG_THAP',
          stationName: 'Đồng Tháp',
          drawDate: '2026-11-14',
          status: 'LOST',
          totalPrize: 0,
          createdAt: '2026-11-14T17:00:00Z',
        },
        {
          id: 'dong-thap_2026-11-14_654321',
          ticket: '654321',
          station: 'dong-thap',
          stationName: 'Đồng Tháp',
          drawDate: '2026-11-14',
          status: 'PENDING',
          totalPrize: 0,
          createdAt: '2026-11-14T18:00:00Z',
        },
      ],
    };

    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(v1Payload));
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
    setItemSpy.mockClear();

    const migrated = await getTickets();
    expect(migrated).toHaveLength(2);

    const won = migrated.find((t) => t.ticket === '012345')!;
    expect(won.id).toBe('tp-hcm_2026-11-14_012345');
    expect(won.station).toBe('tp-hcm');
    expect(won.stationName).toBe('TP. Hồ Chí Minh');
    expect(won.status).toBe('WON');
    expect(won.totalPrize).toBe(200000);
    expect(won.note).toBe('Mua ở chợ Bến Thành');

    const lost = migrated.find((t) => t.ticket === '654321')!;
    expect(lost.id).toBe('dong-thap_2026-11-14_654321');
    expect(lost.station).toBe('dong-thap');
    expect(lost.status).toBe('LOST');

    // Persisted once as v2; subsequent reads do not write again
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    const stored = JSON.parse((await AsyncStorage.getItem(TICKETS_STORAGE_KEY))!);
    expect(stored.version).toBe(2);

    setItemSpy.mockClear();
    resetTicketStoreForTests();
    await getTickets();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
