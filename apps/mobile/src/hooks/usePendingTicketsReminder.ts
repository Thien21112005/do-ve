import { useEffect } from 'react';
import { useSavedTickets } from '@/store/ticketStore';
import { useSettings } from '@/store/settings';
import {
  syncPendingReminders,
  cancelAllPendingReminders,
} from '@/services/reminderNotification';

export function usePendingTicketsReminder(): void {
  const [tickets] = useSavedTickets();
  const [settings] = useSettings();

  useEffect(() => {
    if (settings.reminderEnabled) {
      syncPendingReminders(tickets).catch(() => {});
    } else {
      cancelAllPendingReminders().catch(() => {});
    }
  }, [tickets, settings.reminderEnabled]);
}

