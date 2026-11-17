import { useMemo } from 'react';
import { getActiveDrawSession, type DrawSession } from '@/lib/schedule';

/**
 * One consistent { date, stations } pair for "the session the user is
 * checking" (T11.08). Recomputed on every render (cheap, no timers) and
 * memoized by date so consumers get a stable object until it flips at 16h10.
 */
export function useActiveDrawSession(): DrawSession {
  const current = getActiveDrawSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => current, [current.date]);
}
