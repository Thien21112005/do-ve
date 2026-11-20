import { recheckPendingTickets, RECHECK_BATCH_SIZE } from '../usePendingTicketsRecheck';
import { saveManyTickets, clearAllTickets, getTickets } from '@/store/ticketStore';
import { ApiError } from '@/api/client';
import type { BatchCheckRequest, BatchCheckResponse } from '@/types';

const STATION = 'vinh-long';
const DATE = '2026-11-20';
const tickets = (n: number) =>
  Array.from({ length: n }, (_, i) => String(100000 + i).padStart(6, '0'));

async function seedPending(codes: string[], station = STATION) {
  await saveManyTickets(
    codes.map((ticket) => ({
      ticket,
      station,
      stationName: station,
      drawDate: DATE,
      status: 'PENDING' as const,
      totalPrize: 0,
    })),
  );
}

function checkedResponse(req: BatchCheckRequest): BatchCheckResponse {
  return {
    stationCode: req.stationCode,
    drawDate: req.drawDate,
    totalAmount: 0,
    results: req.tickets.map((ticket) => ({
      ticket,
      stationCode: req.stationCode,
      drawDate: req.drawDate,
      status: 'CHECKED',
      won: false,
      wins: [],
      totalAmount: 0,
    })),
  } as BatchCheckResponse;
}

describe('T13.01 recheck splits pending groups into batches the API accepts', () => {
  beforeEach(async () => {
    await clearAllTickets();
  });

  it('uses the backend batch limit of 20', () => {
    expect(RECHECK_BATCH_SIZE).toBe(20);
  });

  it('settles 25 pending tickets of one draw with batches of 20 + 5', async () => {
    await seedPending(tickets(25));
    const batchFn = jest.fn(async (req: BatchCheckRequest) => checkedResponse(req));

    const { updatedCount } = await recheckPendingTickets(batchFn);

    expect(batchFn.mock.calls.map(([req]) => req.tickets.length)).toEqual([20, 5]);
    expect(updatedCount).toBe(25);
    const stored = await getTickets();
    expect(stored.filter((t) => t.status === 'PENDING')).toHaveLength(0);
  });

  it('a failing chunk does not block the other chunks', async () => {
    await seedPending(tickets(25));
    let call = 0;
    const batchFn = jest.fn(async (req: BatchCheckRequest) => {
      call++;
      if (call === 1) {
        throw new ApiError({ status: 0, code: 'NETWORK_ERROR' });
      }
      return checkedResponse(req);
    });

    const { updatedCount } = await recheckPendingTickets(batchFn);

    expect(batchFn).toHaveBeenCalledTimes(2);
    expect(updatedCount).toBe(5);
    const stored = await getTickets();
    expect(stored.filter((t) => t.status === 'PENDING')).toHaveLength(20);
  });

  it('marks tickets INVALID when the station no longer exists', async () => {
    await seedPending(tickets(2), 'khong-ton-tai');
    const batchFn = jest.fn(async () => {
      throw new ApiError({ status: 404, code: 'STATION_NOT_FOUND' });
    });

    const { updatedCount } = await recheckPendingTickets(batchFn);

    expect(updatedCount).toBe(2);
    const stored = await getTickets();
    expect(stored.every((t) => t.status === 'INVALID')).toBe(true);
  });

  it('keeps tickets PENDING on rate limit so they are retried later', async () => {
    await seedPending(tickets(2));
    const batchFn = jest.fn(async () => {
      throw new ApiError({ status: 429, code: 'RATE_LIMITED' });
    });

    await recheckPendingTickets(batchFn);

    const stored = await getTickets();
    expect(stored.every((t) => t.status === 'PENDING')).toBe(true);
  });
});
