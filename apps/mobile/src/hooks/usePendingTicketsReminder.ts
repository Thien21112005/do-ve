import { useEffect } from 'react';
import { useSavedTickets } from '@/store/ticketStore';
import { useSettings } from '@/store/settings';
import {
  syncPendingReminders,
  cancelAllPendingReminders,
  registerNotificationResponseListener,
} from '@/services/reminderNotification';

export function usePendingTicketsReminder(): void {
  const [tickets] = useSavedTickets();
  const [settings] = useSettings();

  useEffect(() => {
    const subscription = registerNotificationResponseListener();
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (settings.reminderEnabled) {
      syncPendingReminders(tickets).catch(() => {});
    } else {
      cancelAllPendingReminders().catch(() => {});
    }
  }, [tickets, settings.reminderEnabled]);
}

