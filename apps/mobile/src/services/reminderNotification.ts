import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { formatDateVN } from '@/lib/format';
import type { SavedTicket } from '@/types';

export const REMINDER_DATA_TYPE = 'DOVE_PENDING_REMINDER';
export const REMINDER_CHANNEL_ID = 'dove_reminders';

// Configure foreground notification presentation (T09.42)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure Android notification channel with high priority (T09.42)
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Nhắc nhở dò vé',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D9381E',
    });
  }
}

/**
 * Listen for notification response click and navigate to Tickets tab (T09.42)
 */
export function registerNotificationResponseListener(
  onNavigate?: (route: string) => void,
): { remove: () => void } {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response?.notification?.request?.content?.data;
      if (data?.type === REMINDER_DATA_TYPE) {
        if (onNavigate) {
          onNavigate('/(tabs)/tickets');
        } else {
          router.push('/(tabs)/tickets');
        }
      }
    },
  );

  return subscription;
}

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

/**
 * Check whether notification permission is currently granted without requesting (T09.44)
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    return current.granted || current.status === 'granted';
  } catch {
    return false;
  }
}

export function calculateReminderTime(drawDate: string): Date {
  const parts = drawDate.split('-').map(Number);
  const year = parts[0] ?? new Date().getFullYear();
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  // 16:45:00 in Vietnam (UTC+7) corresponds exactly to 09:45:00 UTC everywhere
  return new Date(Date.UTC(year, month - 1, day, 9, 45, 0, 0));
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
    // Ensure Android notification channel is configured
    await setupNotificationChannel();

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

      const displayDate = formatDateVN(drawDate);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Đã có kết quả xổ số kiến thiết',
          body: `Bạn có ${count} vé đang chờ dò cho kỳ quay ngày ${displayDate}. Hãy mở DoVe để kiểm tra ngay!`,
          data: {
            type: REMINDER_DATA_TYPE,
            drawDate,
            count,
          },
          sound: 'default',
          ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
          ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
        },
      });
    }
  } catch {
    // Ignore scheduling errors on unsupported devices/environments
  }
}

