import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  recheckPendingTickets,
  runSharedRecheck,
  resetRecheckThrottle,
} from '../usePendingTicketsRecheck';
import { saveTicket, getTickets, resetTicketStoreForTests } from '@/store/ticketStore';
import { ApiError } from '@/api/client';

const pending = (ticket: string, station = 'tp-hcm') => ({
  ticket,
  station,
  stationName: 'TP. Hồ Chí Minh',
  drawDate: '2026-11-15',
  status: 'PENDING' as const,
  totalPrize: 0,
});

describe('pending ticket recheck hardening (T11.16)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetTicketStoreForTests();
    resetRecheckThrottle();
  });

  it('(a) only CHECKED results settle a ticket; unknown statuses stay PENDING', async () => {
    await saveTicket(pending('111111'));
    const batch = jest.fn().mockResolvedValue({
      stationCode: 'tp-hcm',
      drawDate: '2026-11-15',
      results: [{ ticket: '111111', status: 'SOMETHING_NEW', won: false, wins: [] }],
    });
    const { updatedCount } = await recheckPendingTickets(batch);
    expect(updatedCount).toBe(0);
    expect((await getTickets())[0].status).toBe('PENDING');
  });

  it('(b) stores wins mapped for the UI (tierName, matchedDigits)', async () => {
    await saveTicket(pending('123456'));
    const batch = jest.fn().mockResolvedValue({
      stationCode: 'tp-hcm',
      drawDate: '2026-11-15',
      results: [
        {
          ticket: '123456',
          status: 'CHECKED',
          won: true,
          wins: [{ tier: 'SEVENTH', matchedNumber: '456', prizeAmount: 200000 }],
          totalAmount: 200000,
        },
      ],
    });
    await recheckPendingTickets(batch);
    const [t] = await getTickets();
    expect(t.status).toBe('WON');
    expect(t.wins?.[0]).toEqual(
      expect.objectContaining({ tierName: 'Giải Bảy', matchedDigits: '456' }),
    );
  });

  it('(c) concurrent runs (two mounted hooks) share one request', async () => {
    await saveTicket(pending('222222'));
    let resolve: (v: unknown) => void = () => {};
    const batch = jest.fn().mockReturnValue(new Promise((r) => (resolve = r)));
    const p1 = runSharedRecheck(batch);
    const p2 = runSharedRecheck(batch);
    resolve({ stationCode: 'tp-hcm', drawDate: '2026-11-15', results: [] });
    await Promise.all([p1, p2]);
    expect(batch).toHaveBeenCalledTimes(1);
  });

  it('(d) STATION_NOT_DRAWING marks the group INVALID instead of retrying forever', async () => {
    await saveTicket(pending('333333', 'ben-tre'));
    const batch = jest
      .fn()
      .mockRejectedValue(new ApiError({ status: 422, code: 'STATION_NOT_DRAWING' }));
    const { updatedCount } = await recheckPendingTickets(batch);
    expect(updatedCount).toBe(1);
    expect((await getTickets())[0].status).toBe('INVALID');
  });
});
