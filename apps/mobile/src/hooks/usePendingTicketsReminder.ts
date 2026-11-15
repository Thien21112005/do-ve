import { useEffect, useRef, useMemo } from 'react';
import { useSavedTickets } from '@/store/ticketStore';
import { useSettings } from '@/store/settings';
import * as reminderNotification from '@/services/reminderNotification';
import type { SavedTicket } from '@/types';

/**
 * Computes a deterministic string key representing the set of pending tickets and their dates.
 * Format: "YYYY-MM-DD:count|YYYY-MM-DD:count" (T09.43)
 */
export function getPendingTicketsKey(tickets: SavedTicket[]): string {
  const pending = tickets.filter((t) => t.status === 'PENDING');
  if (pending.length === 0) return '';

  const dateCounts = new Map<string, number>();
  for (const t of pending) {
    dateCounts.set(t.drawDate, (dateCounts.get(t.drawDate) ?? 0) + 1);
  }

  return Array.from(dateCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, c]) => `${d}:${c}`)
    .join('|');
}

export function usePendingTicketsReminder(): void {
  const [tickets] = useSavedTickets();
  const [settings] = useSettings();
  const lastSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const subscription = reminderNotification.registerNotificationResponseListener();
    return () => {
      subscription.remove();
    };
  }, []);

  const pendingKey = useMemo(() => getPendingTicketsKey(tickets), [tickets]);

  useEffect(() => {
    if (!settings.reminderEnabled) {
      if (lastSyncKeyRef.current !== null) {
        reminderNotification.cancelAllPendingReminders().catch(() => {});
        lastSyncKeyRef.current = null;
      }
      return;
    }

    // Only resync when the pending tickets key actually changes (T09.43)
    if (lastSyncKeyRef.current !== pendingKey) {
      lastSyncKeyRef.current = pendingKey;
      reminderNotification.syncPendingReminders(tickets).catch(() => {});
    }
  }, [pendingKey, settings.reminderEnabled, tickets]);
}

