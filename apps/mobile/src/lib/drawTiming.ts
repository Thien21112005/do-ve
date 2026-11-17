import { todayVN } from './date';

export interface DrawQueryTiming {
  staleTime: number;
  refetchInterval: number | false;
}

/**
 * Cache policy for draw queries (T11.11):
 * - today, still missing numbers → poll (stale 20s, refetch 30s)
 * - today, complete              → 10 min
 * - past, incomplete             → 60s (backend may backfill)
 * - past, complete               → never refetch
 */
export function drawQueryTiming(
  date: string,
  isComplete: boolean,
  today: string = todayVN(),
): DrawQueryTiming {
  const isToday = date >= today;
  if (isToday && !isComplete) return { staleTime: 20_000, refetchInterval: 30_000 };
  if (isToday) return { staleTime: 10 * 60_000, refetchInterval: false };
  if (!isComplete) return { staleTime: 60_000, refetchInterval: false };
  return { staleTime: Infinity, refetchInterval: false };
}
