import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import {
  groupPendingTickets,
  recheckPendingTickets,
  usePendingTicketsRecheck,
} from '../usePendingTicketsRecheck';
import {
  saveTicket,
  clearAllTickets,
  getTickets,
} from '@/store/ticketStore';
import * as apiCheck from '@/api/check';
import type { BatchCheckResponse, SavedTicket } from '@/types';

jest.mock('@/api/check');

describe('usePendingTicketsRecheck & recheckPendingTickets', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearAllTickets();
  });

  describe('groupPendingTickets', () => {
    it('groups pending tickets by station and drawDate while ignoring non-pending tickets', () => {
      const tickets: SavedTicket[] = [
        {
          id: '1',
          ticket: '111111',
          station: 'TPHCM',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-14',
          status: 'PENDING',
          createdAt: '2026-11-14T10:00:00Z',
          totalPrize: 0,
        },
        {
          id: '2',
          ticket: '222222',
          station: 'TPHCM',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-14',
          status: 'PENDING',
          createdAt: '2026-11-14T10:05:00Z',
          totalPrize: 0,
        },
        {
          id: '3',
          ticket: '333333',
          station: 'BD',
          stationName: 'Bình Dương',
          drawDate: '2026-11-14',
          status: 'PENDING',
          createdAt: '2026-11-14T10:10:00Z',
          totalPrize: 0,
        },
        {
          id: '4',
          ticket: '444444',
          station: 'TPHCM',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-14',
          status: 'WON',
          createdAt: '2026-11-14T10:00:00Z',
          totalPrize: 100000,
        },
      ];

      const groups = groupPendingTickets(tickets);
      expect(groups).toHaveLength(2);

      const tphcmGroup = groups.find((g) => g.station === 'TPHCM');
      expect(tphcmGroup).toBeDefined();
      expect(tphcmGroup?.tickets).toHaveLength(2);

      const bdGroup = groups.find((g) => g.station === 'BD');
      expect(bdGroup).toBeDefined();
      expect(bdGroup?.tickets).toHaveLength(1);
    });
  });

  describe('recheckPendingTickets transition (Call 1: RESULT_NOT_AVAILABLE -> Call 2: CHECKED)', () => {
    it('maintains PENDING when result is not available, then transitions to WON/LOST when available', async () => {
      // Setup pending tickets in store
      await saveTicket({
        ticket: '123456',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'PENDING',
        totalPrize: 0,
      });

      await saveTicket({
        ticket: '654321',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'PENDING',
        totalPrize: 0,
      });

      // Call 1: Results not available yet
      const notAvailableResponse: BatchCheckResponse = {
        station: 'TPHCM',
        drawDate: '2026-11-14',
        results: [
          {
            ticket: '123456',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'RESULT_NOT_AVAILABLE',
            won: null,
            wins: [],
            totalPrize: 0,
            message: 'Chưa có kết quả',
          },
          {
            ticket: '654321',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'RESULT_NOT_AVAILABLE',
            won: null,
            wins: [],
            totalPrize: 0,
            message: 'Chưa có kết quả',
          },
        ],
        totalWonTickets: 0,
        totalPrize: 0,
      };

      (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValueOnce(
        notAvailableResponse,
      );

      const res1 = await recheckPendingTickets();
      expect(res1.updatedCount).toBe(0);

      // Verify still PENDING
      const ticketsAfterCall1 = await getTickets();
      expect(ticketsAfterCall1.every((t) => t.status === 'PENDING')).toBe(true);

      // Call 2: Results are now available! 123456 won, 654321 lost
      const checkedResponse: BatchCheckResponse = {
        station: 'TPHCM',
        drawDate: '2026-11-14',
        results: [
          {
            ticket: '123456',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'CHECKED',
            won: true,
            wins: [
              {
                tier: 'SPECIAL',
                tierName: 'Giải Đặc Biệt',
                prizeAmount: 2000000000,
                matchedDigits: '123456',
              },
            ],
            totalPrize: 2000000000,
            message: null,
          },
          {
            ticket: '654321',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'CHECKED',
            won: false,
            wins: [],
            totalPrize: 0,
            message: null,
          },
        ],
        totalWonTickets: 1,
        totalPrize: 2000000000,
      };

      (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValueOnce(
        checkedResponse,
      );

      const res2 = await recheckPendingTickets();
      expect(res2.updatedCount).toBe(2);

      // Verify status changed in store
      const ticketsAfterCall2 = await getTickets();
      const wonTicket = ticketsAfterCall2.find((t) => t.ticket === '123456');
      const lostTicket = ticketsAfterCall2.find((t) => t.ticket === '654321');

      expect(wonTicket?.status).toBe('WON');
      expect(wonTicket?.totalPrize).toBe(2000000000);
      expect(wonTicket?.wins).toHaveLength(1);

      expect(lostTicket?.status).toBe('LOST');
      expect(lostTicket?.totalPrize).toBe(0);
    });
  });

  describe('usePendingTicketsRecheck hook lifecycle', () => {
    it('triggers recheck on mount and when AppState changes to active', async () => {
      let appStateListener: ((state: string) => void) | undefined;
      jest
        .spyOn(AppState, 'addEventListener')
        .mockImplementation((_event, listener) => {
          appStateListener = listener as any;
          return { remove: jest.fn() } as any;
        });

      await saveTicket({
        ticket: '777888',
        station: 'TPHCM',
        stationName: 'TP. Hồ Chí Minh',
        drawDate: '2026-11-14',
        status: 'PENDING',
        totalPrize: 0,
      });

      // 1st call on mount: Returns RESULT_NOT_AVAILABLE (ticket remains PENDING)
      (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValueOnce({
        station: 'TPHCM',
        drawDate: '2026-11-14',
        results: [
          {
            ticket: '777888',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'RESULT_NOT_AVAILABLE',
            won: null,
            wins: [],
            totalPrize: 0,
            message: null,
          },
        ],
        totalWonTickets: 0,
        totalPrize: 0,
      });

      // 2nd call on AppState active: Returns CHECKED
      (apiCheck.checkBatchTickets as jest.Mock).mockResolvedValueOnce({
        station: 'TPHCM',
        drawDate: '2026-11-14',
        results: [
          {
            ticket: '777888',
            station: 'TPHCM',
            stationName: 'TP. Hồ Chí Minh',
            drawDate: '2026-11-14',
            status: 'CHECKED',
            won: true,
            wins: [],
            totalPrize: 500000,
            message: null,
          },
        ],
        totalWonTickets: 1,
        totalPrize: 500000,
      });

      const onComplete = jest.fn();
      renderHook(() =>
        usePendingTicketsRecheck({ onRecheckComplete: onComplete }),
      );

      // Wait for mount recheck
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(apiCheck.checkBatchTickets).toHaveBeenCalledTimes(1);

      // Trigger AppState change to 'active'
      await act(async () => {
        appStateListener?.('active');
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(apiCheck.checkBatchTickets).toHaveBeenCalledTimes(2);
    });
  });
});
