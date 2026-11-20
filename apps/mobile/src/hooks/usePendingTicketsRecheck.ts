import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { getTickets, updateTicket } from '@/store/ticketStore';
import { checkBatchTickets } from '@/api/check';
import { ApiError } from '@/api/client';
import { mapCheckResponseToUi } from '@/api/mappers';
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

/** Max tickets per /check/batch request, same as the backend's @Size(max = 20) (T13.01). */
export const RECHECK_BATCH_SIZE = 20;

/**
 * Errors that will never go away by retrying: the tickets are marked INVALID
 * instead of being rechecked forever (T11.16d, T13.01).
 */
const PERMANENT_ERROR_CODES = new Set(['STATION_NOT_DRAWING', 'STATION_NOT_FOUND']);

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Checks all PENDING tickets by querying the batch check API for each group,
 * in chunks of at most RECHECK_BATCH_SIZE tickets. A failing chunk does not
 * stop the others. Automatically updates the store with WON/LOST status.
 */
export async function recheckPendingTickets(
  batchCheckFn = checkBatchTickets,
  updateFn = updateTicket,
): Promise<{ updatedCount: number }> {
  try {
    const allTickets = await getTickets();
    const groups = groupPendingTickets(allTickets).flatMap((group) =>
      chunk(group.tickets, RECHECK_BATCH_SIZE).map((tickets) => ({ ...group, tickets })),
    );

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
            // Only a fully checked result settles a ticket (T11.16a)
            if (itemResult.status === 'CHECKED') {
              const matchedTicket = group.tickets.find(
                (t) => t.ticket === itemResult.ticket,
              );
              if (matchedTicket) {
                // Store wins in UI shape (tierName, matchedDigits) (T11.16b)
                const ui = mapCheckResponseToUi({
                  ...itemResult,
                  stationCode: itemResult.stationCode || group.station,
                  drawDate: itemResult.drawDate || group.drawDate,
                });
                await updateFn(matchedTicket.id, {
                  status: ui.won ? 'WON' : 'LOST',
                  totalPrize: ui.totalAmount,
                  wins: ui.wins,
                });
                updatedCount++;
              }
            }
          }
        }
      } catch (err) {
        // A station that does not draw that day (or no longer exists) will never
        // get a result: mark the tickets INVALID instead of rechecking forever
        if (err instanceof ApiError && err.code && PERMANENT_ERROR_CODES.has(err.code)) {
          for (const t of group.tickets) {
            await updateFn(t.id, { status: 'INVALID' });
            updatedCount++;
          }
        }
        // Other failures: keep PENDING and try again next time
      }
    }

    return { updatedCount };
  } catch {
    return { updatedCount: 0 };
  }
}

/**
 * One in-flight recheck for the whole app: the hook is mounted in more than
 * one place (root layout and the tickets tab), and per-instance flags let
 * both run at once (T11.16c).
 */
let inFlight: Promise<{ updatedCount: number }> | null = null;

export function runSharedRecheck(
  batchCheckFn = checkBatchTickets,
): Promise<{ updatedCount: number }> {
  if (!inFlight) {
    inFlight = recheckPendingTickets(batchCheckFn).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

export const DEFAULT_RECHECK_THROTTLE_MS = 2 * 60 * 1000; // 2 minutes (T09.45)

let lastRecheckTimestamp = 0;

export function resetRecheckThrottle(): void {
  lastRecheckTimestamp = 0;
}

export function setLastRecheckTimestamp(ts: number): void {
  lastRecheckTimestamp = ts;
}

export function getLastRecheckTimestamp(): number {
  return lastRecheckTimestamp;
}

/**
 * React hook that triggers pending ticket recheck when the screen mounts
 * or when the app returns from background to foreground (AppState 'active').
 * Throttles automatic recheck calls to 2 minutes between runs (T09.45).
 */
export function usePendingTicketsRecheck(options?: {
  enabled?: boolean;
  throttleMs?: number;
  onRecheckComplete?: (updatedCount: number) => void;
}) {
  const {
    enabled = true,
    throttleMs = DEFAULT_RECHECK_THROTTLE_MS,
    onRecheckComplete,
  } = options || {};
  const [isRechecking, setIsRechecking] = useState(false);
  const isRunningRef = useRef(false);

  const runRecheck = useCallback(
    async (force = false) => {
      if (!enabled || isRunningRef.current) return;
      const now = Date.now();
      if (!force && throttleMs > 0 && now - lastRecheckTimestamp < throttleMs) {
        return;
      }
      const alreadyRunning = inFlight !== null;
      isRunningRef.current = true;
      setIsRechecking(true);
      try {
        const { updatedCount } = await runSharedRecheck();
        lastRecheckTimestamp = Date.now();
        // Only the instance that started the run reports the count
        if (updatedCount > 0 && !alreadyRunning) {
          onRecheckComplete?.(updatedCount);
        }
      } finally {
        isRunningRef.current = false;
        setIsRechecking(false);
      }
    },
    [enabled, throttleMs, onRecheckComplete],
  );

  useEffect(() => {
    // Recheck on mount (respecting throttle)
    runRecheck(false);

    // Recheck when app transitions to active foreground (respecting throttle)
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          runRecheck(false);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [runRecheck]);

  return {
    isRechecking,
    refetchPending: (force = true) => runRecheck(force),
  };
}
