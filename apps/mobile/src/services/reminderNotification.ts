import * as Notifications from 'expo-notifications';
import type { SavedTicket } from '@/types';

export const REMINDER_DATA_TYPE = 'DOVE_PENDING_REMINDER';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.status === 'granted') {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted || requested.status === 'granted';
  } catch {
    return false;
  }
}

export function calculateReminderTime(drawDate: string): Date {
  const parts = drawDate.split('-').map(Number);
  const year = parts[0] ?? new Date().getFullYear();
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day, 16, 45, 0, 0);
}

export async function cancelAllPendingReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      if (item.content?.data?.type === REMINDER_DATA_TYPE) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  } catch {
    // Ignore cancellation errors
  }
}

export async function syncPendingReminders(tickets: SavedTicket[]): Promise<void> {
  try {
    // 1. Cancel previous pending reminders
    await cancelAllPendingReminders();

    // 2. Filter pending tickets and group by drawDate
    const pendingTickets = tickets.filter((t) => t.status === 'PENDING');
    if (pendingTickets.length === 0) {
      return;
    }

    const countsByDate = new Map<string, number>();
    for (const ticket of pendingTickets) {
      const current = countsByDate.get(ticket.drawDate) ?? 0;
      countsByDate.set(ticket.drawDate, current + 1);
    }

    const now = Date.now();

    for (const [drawDate, count] of countsByDate.entries()) {
      const reminderTime = calculateReminderTime(drawDate);
      if (reminderTime.getTime() <= now) {
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Đã có kết quả xổ số kiến thiết',
          body: `Bạn có ${count} vé đang chờ dò cho kỳ quay ngày ${drawDate}. Hãy mở DoVe để kiểm tra ngay!`,
          data: {
            type: REMINDER_DATA_TYPE,
            drawDate,
            count,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });
    }
  } catch {
    // Ignore scheduling errors on unsupported devices/environments
  }
}

