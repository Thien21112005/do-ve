import { drawQueryTiming } from '../drawTiming';

const TODAY = '2026-11-16';

describe('drawQueryTiming (T11.11)', () => {
  it('today and not complete → poll: stale 20s, refetch every 30s', () => {
    expect(drawQueryTiming('2026-11-16', false, TODAY)).toEqual({
      staleTime: 20_000,
      refetchInterval: 30_000,
    });
  });

  it('past and complete → frozen forever', () => {
    expect(drawQueryTiming('2026-11-15', true, TODAY)).toEqual({
      staleTime: Infinity,
      refetchInterval: false,
    });
  });

  it('past but incomplete (ingestion may backfill) → short stale, no polling', () => {
    expect(drawQueryTiming('2026-11-15', false, TODAY)).toEqual({
      staleTime: 60_000,
      refetchInterval: false,
    });
  });

  it('today and complete → stable for a while, no polling', () => {
    expect(drawQueryTiming('2026-11-16', true, TODAY)).toEqual({
      staleTime: 10 * 60_000,
      refetchInterval: false,
    });
  });
});
