import { STRINGS } from './strings';

export interface QuickMatch {
  tier: string;
  number: string;
  station?: string;
}

export interface QuickSearchDraw {
  stationName?: string;
  numbers: Record<string, string[]>;
}

/** Same rule DrawTable uses to highlight: query of 2–6 digits matches a number's suffix. */
export function findQuickMatches(draws: QuickSearchDraw[], query: string): QuickMatch[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const matches: QuickMatch[] = [];
  for (const draw of draws) {
    for (const [tier, nums] of Object.entries(draw.numbers ?? {})) {
      for (const n of nums ?? []) {
        if (n.endsWith(q)) matches.push({ tier, number: n, station: draw.stationName });
      }
    }
  }
  return matches;
}

/**
 * Feedback line under the quick search box (T11.19):
 * "Không có số nào khớp ‘1234’ trong bảng này" or "Khớp 2 giải: G.7 · 301, G.4 · 04512".
 */
export function quickSearchFeedback(
  matches: QuickMatch[],
  query: string,
  shortName: (tier: string) => string,
  withStation = false,
): string | null {
  const q = query.trim();
  if (q.length < 2) return null;
  if (matches.length === 0) return STRINGS.results.quickSearchNoMatch(q);
  const parts = matches.map(
    (m) =>
      `${shortName(m.tier)} · ${m.number}${withStation && m.station ? ` (${m.station})` : ''}`,
  );
  return STRINGS.results.quickSearchMatchCount(matches.length, parts.join(', '));
}
