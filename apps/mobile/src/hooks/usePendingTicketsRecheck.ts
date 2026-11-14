import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { getTickets, updateTicket } from '@/store/ticketStore';
import { checkBatchTickets } from '@/api/check';
import type { SavedTicket } from '@/types';

export interface PendingGroup {
  station: string;
  drawDate: string;
  tickets: SavedTicket[];
}

/**
 * Groups all PENDING tickets by station and drawDate so they can be
 * checked in batch efficiently.
 */
export function groupPendingTickets(tickets: SavedTicket[]): PendingGroup[] {
  const pending = tickets.filter((t) => t.status === 'PENDING');
  const groupMap = new Map<string, PendingGroup>();

  for (const t of pending) {
    const key = `${t.station}_${t.drawDate}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        station: t.station,
        drawDate: t.drawDate,
        tickets: [],
      });
    }
    groupMap.get(key)!.tickets.push(t);
  }

  return Array.from(groupMap.values());
}

/**
 * Checks all PENDING tickets by querying the batch check API for each group.
 * Automatically updates the store with WON/LOST status and prize details.
 */
export async function recheckPendingTickets(
  batchCheckFn = checkBatchTickets,
  updateFn = updateTicket,
): Promise<{ updatedCount: number }> {
  try {
    const allTickets = await getTickets();
    const groups = groupPendingTickets(allTickets);

    if (groups.length === 0) {
      return { updatedCount: 0 };
    }

    let updatedCount = 0;

    for (const group of groups) {
      try {
        const ticketCodes = group.tickets.map((t) => t.ticket);
        const response = await batchCheckFn({
          stationCode: group.station,
          drawDate: group.drawDate,
          tickets: ticketCodes,
        });

        if (response && Array.isArray(response.results)) {
          for (const itemResult of response.results) {
            if (
              itemResult.status === 'CHECKED' ||
              itemResult.status === 'WIN' ||
              itemResult.status === 'LOSE' ||
              (itemResult.status && itemResult.status !== 'RESULT_NOT_AVAILABLE')
            ) {
              const matchedTicket = group.tickets.find(
                (t) => t.ticket === itemResult.ticket,
              );
              if (matchedTicket) {
                const newStatus = itemResult.won ? 'WON' : 'LOST';
                await updateFn(matchedTicket.id, {
                  status: newStatus,
                  totalPrize: itemResult.totalAmount || 0,
                  wins: itemResult.wins || [],
                });
                updatedCount++;
              }
            }
          }
        }
      } catch {
        // Continue checking other groups even if one fails
      }
    }

    return { updatedCount };
  } catch {
    return { updatedCount: 0 };
  }
}

/**
 * React hook that triggers pending ticket recheck when the screen mounts
 * or when the app returns from background to foreground (AppState 'active').
 */
export function usePendingTicketsRecheck(options?: {
  enabled?: boolean;
  onRecheckComplete?: (updatedCount: number) => void;
}) {
  const { enabled = true, onRecheckComplete } = options || {};
  const [isRechecking, setIsRechecking] = useState(false);
  const isRunningRef = useRef(false);

  const runRecheck = useCallback(async () => {
    if (!enabled || isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRechecking(true);
    try {
      const { updatedCount } = await recheckPendingTickets();
      if (updatedCount > 0) {
        onRecheckComplete?.(updatedCount);
      }
    } finally {
      isRunningRef.current = false;
      setIsRechecking(false);
    }
  }, [enabled, onRecheckComplete]);

  useEffect(() => {
    // Recheck on mount
    runRecheck();

    // Recheck when app transitions to active foreground
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          runRecheck();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [runRecheck]);

  return { isRechecking, refetchPending: runRecheck };
}
