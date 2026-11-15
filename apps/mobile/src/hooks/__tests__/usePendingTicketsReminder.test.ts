import { renderHook, waitFor, cleanup } from '@testing-library/react-native';
import {
  usePendingTicketsReminder,
  getPendingTicketsKey,
} from '../usePendingTicketsReminder';
import * as reminderNotification from '@/services/reminderNotification';
import * as ticketStore from '@/store/ticketStore';
import * as settingsStore from '@/store/settings';
import type { SavedTicket } from '@/types';

jest.mock('@/services/reminderNotification');

describe('usePendingTicketsReminder (T09.43)', () => {
  let mockTickets: SavedTicket[];
  let mockSettings: { reminderEnabled: boolean };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTickets = [];
    mockSettings = { reminderEnabled: true };

    jest.spyOn(ticketStore, 'useSavedTickets').mockImplementation(() => [
      mockTickets,
      {} as any,
    ]);

    jest.spyOn(settingsStore, 'useSettings').mockImplementation(() => [
      mockSettings as any,
      jest.fn(),
    ]);

    (reminderNotification.syncPendingReminders as jest.Mock).mockResolvedValue(undefined);
    (reminderNotification.cancelAllPendingReminders as jest.Mock).mockResolvedValue(undefined);
    (reminderNotification.registerNotificationResponseListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });
  });

  afterEach(async () => {
    cleanup();
    await new Promise((r) => setTimeout(r, 10));
  });

  describe('getPendingTicketsKey', () => {
    it('returns empty string when no pending tickets exist', () => {
      const tickets: SavedTicket[] = [
        {
          id: '1',
          ticket: '123456',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-20',
          status: 'WON',
          totalPrize: 100000,
          createdAt: '',
        },
      ];
      expect(getPendingTicketsKey(tickets)).toBe('');
    });

    it('creates deterministic sorted key for pending tickets', () => {
      const tickets: SavedTicket[] = [
        {
          id: '1',
          ticket: '111111',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-22',
          status: 'PENDING',
          totalPrize: 0,
          createdAt: '',
        },
        {
          id: '2',
          ticket: '222222',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-20',
          status: 'PENDING',
          totalPrize: 0,
          createdAt: '',
        },
        {
          id: '3',
          ticket: '333333',
          station: 'dong-nai',
          stationName: 'Đồng Nai',
          drawDate: '2026-11-20',
          status: 'PENDING',
          totalPrize: 0,
          createdAt: '',
        },
      ];
      expect(getPendingTicketsKey(tickets)).toBe('2026-11-20:2|2026-11-22:1');
    });
  });

  describe('resync optimization', () => {
    const pendingTicket: SavedTicket = {
      id: '1',
      ticket: '111111',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-20',
      status: 'PENDING',
      totalPrize: 0,
      createdAt: '',
    };

    it('does not re-sync reminders when non-pending tickets change', async () => {
      mockTickets = [pendingTicket];
      mockSettings = { reminderEnabled: true };

      const { rerender } = await renderHook(() => usePendingTicketsReminder());
      await waitFor(() => {
        expect(reminderNotification.syncPendingReminders).toHaveBeenCalledTimes(1);
      });

      // Add a WON ticket - pending set remains unchanged
      mockTickets = [
        pendingTicket,
        {
          id: '2',
          ticket: '222222',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2026-11-20',
          status: 'WON',
          totalPrize: 2000000,
          createdAt: '',
        },
      ];

      rerender({});

      // Should NOT have triggered another syncPendingReminders call
      expect(reminderNotification.syncPendingReminders).toHaveBeenCalledTimes(1);
    });

    it('re-syncs reminders when pending tickets key changes', async () => {
      mockTickets = [pendingTicket];
      mockSettings = { reminderEnabled: true };

      const { rerender } = await renderHook(() => usePendingTicketsReminder());
      await waitFor(() => {
        expect(reminderNotification.syncPendingReminders).toHaveBeenCalledTimes(1);
      });

      // Add another PENDING ticket - pending key changes
      mockTickets = [
        pendingTicket,
        {
          id: '3',
          ticket: '333333',
          station: 'dong-nai',
          stationName: 'Đồng Nai',
          drawDate: '2026-11-21',
          status: 'PENDING',
          totalPrize: 0,
          createdAt: '',
        },
      ];

      rerender({});

      await waitFor(() => {
        expect(reminderNotification.syncPendingReminders).toHaveBeenCalledTimes(2);
      });
    });

    it('cancels reminders when reminderEnabled is toggled off', async () => {
      mockTickets = [pendingTicket];
      mockSettings = { reminderEnabled: true };

      const { rerender } = await renderHook(() => usePendingTicketsReminder());
      await waitFor(() => {
        expect(reminderNotification.syncPendingReminders).toHaveBeenCalledTimes(1);
      });

      mockSettings = { reminderEnabled: false };
      rerender({});

      await waitFor(() => {
        expect(reminderNotification.cancelAllPendingReminders).toHaveBeenCalledTimes(1);
      });
    });
  });
});
