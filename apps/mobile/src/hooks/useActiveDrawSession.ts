import { useEffect, useState } from 'react';
import { getActiveDrawSession, type DrawSession } from '@/lib/schedule';

/**
 * One consistent { date, stations } pair for "the session the user is
 * checking" (T11.08). Re-evaluated every minute so it flips at 16h10.
 */
export function useActiveDrawSession(): DrawSession {
  const [session, setSession] = useState(() => getActiveDrawSession());

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getActiveDrawSession();
      setSession((prev) => (prev.date === next.date ? prev : next));
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  return session;
}
