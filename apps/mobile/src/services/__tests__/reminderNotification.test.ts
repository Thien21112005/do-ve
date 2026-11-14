import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermission,
  calculateReminderTime,
  syncPendingReminders,
  cancelAllPendingReminders,
  REMINDER_DATA_TYPE,
} from '../reminderNotification';
import type { SavedTicket } from '@/types';

describe('reminderNotification service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermission', () => {
    it('returns true if permission is already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const granted = await requestNotificationPermission();
      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission if not yet granted and returns true on approval', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
      });

      const granted = await requestNotificationPermission();
      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false if user denies permission', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
      });

      const granted = await requestNotificationPermission();
      expect(granted).toBe(false);
    });
  });

  describe('calculateReminderTime', () => {
    it('calculates 16:45:00 on the specified draw date', () => {
      const time = calculateReminderTime('2026-11-20');
      expect(time.getFullYear()).toBe(2026);
      expect(time.getMonth()).toBe(10); // 0-indexed November
      expect(time.getDate()).toBe(20);
      expect(time.getHours()).toBe(16);
      expect(time.getMinutes()).toBe(45);
      expect(time.getSeconds()).toBe(0);
    });
  });

  describe('syncPendingReminders', () => {
    const futureDate = '2099-12-31';

    it('does nothing if no pending tickets are present', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([]);

      const tickets: SavedTicket[] = [
        {
          id: 't-1',
          ticket: '123456',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: futureDate,
          status: 'WON',
          totalPrize: 2000000,
          createdAt: new Date().toISOString(),
        },
      ];

      await syncPendingReminders(tickets);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('schedules notification for future pending tickets grouped by drawDate', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([]);

      const tickets: SavedTicket[] = [
        {
          id: 't-1',
          ticket: '111111',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: futureDate,
          status: 'PENDING',
          totalPrize: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 't-2',
          ticket: '222222',
          station: 'dong-nai',
          stationName: 'Đồng Nai',
          drawDate: futureDate,
          status: 'PENDING',
          totalPrize: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      await syncPendingReminders(tickets);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
      const callArg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(callArg.content.title).toContain('kết quả');
      expect(callArg.content.body).toContain('2 vé');
      expect(callArg.content.data.type).toBe(REMINDER_DATA_TYPE);
      expect(callArg.content.data.drawDate).toBe(futureDate);
    });

    it('cancels existing pending reminders before rescheduling', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'old-notif-1',
          content: { data: { type: REMINDER_DATA_TYPE } },
        },
        {
          identifier: 'other-app-notif',
          content: { data: { type: 'OTHER' } },
        },
      ]);

      const tickets: SavedTicket[] = [
        {
          id: 't-1',
          ticket: '111111',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: futureDate,
          status: 'PENDING',
          totalPrize: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      await syncPendingReminders(tickets);

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-notif-1');
      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('other-app-notif');
    });

    it('does not schedule reminders for past dates', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([]);

      const pastTickets: SavedTicket[] = [
        {
          id: 't-1',
          ticket: '111111',
          station: 'tp-hcm',
          stationName: 'TP. Hồ Chí Minh',
          drawDate: '2020-01-01',
          status: 'PENDING',
          totalPrize: 0,
          createdAt: new Date().toISOString(),
        },
      ];

      await syncPendingReminders(pastTickets);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('cancelAllPendingReminders', () => {
    it('cancels only notifications belonging to REMINDER_DATA_TYPE', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        {
          identifier: 'rem-1',
          content: { data: { type: REMINDER_DATA_TYPE } },
        },
        {
          identifier: 'not-mine',
          content: { data: { type: 'SOME_OTHER' } },
        },
      ]);

      await cancelAllPendingReminders();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('rem-1');
      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('not-mine');
    });
  });
});

