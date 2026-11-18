import { scanDesignDebt, type DebtCounts } from '@/test-utils/designDebt';

/**
 * Design-debt ratchet (T11.06).
 *
 * Counts per file of patterns that bypass the design system: raw RN
 * Text/TouchableOpacity, hard-coded hex colors, `${color}1A` alpha
 * concatenation, raw Tailwind palette classes, text-[10px]/[11px] and
 * text-white. Numbers may only go DOWN. When you migrate a file, lower
 * (or delete) its entry here. Goal at the end of Phase 11: empty.
 */
const ALLOWLIST: DebtCounts = {
  'app/(tabs)/more.tsx': { rawRnPrimitive: 1, alphaConcat: 1 },
  'app/(tabs)/results.tsx': { rawRnPrimitive: 2, alphaConcat: 4, rawPaletteClass: 4 },
  'app/(tabs)/tickets.tsx': {
    rawRnPrimitive: 2,
    hexColor: 6,
    alphaConcat: 3,
    tinyArbitraryText: 2,
    textWhite: 6,
  },
  'app/about.tsx': { rawRnPrimitive: 1, hexColor: 2, alphaConcat: 2 },
  'app/schedule.tsx': { rawRnPrimitive: 1, hexColor: 1, alphaConcat: 7 },
  'app/settings.tsx': { rawRnPrimitive: 1, hexColor: 4 },
  'components/AppVersionGate.tsx': { rawRnPrimitive: 1 },
  'components/ErrorBoundary.tsx': { rawRnPrimitive: 1, alphaConcat: 2 },
  'components/Icon.tsx': { hexColor: 1 },
  'components/MultiStationDrawTable.tsx': { rawRnPrimitive: 1, alphaConcat: 4 },
  'components/OfflineBanner.tsx': { rawRnPrimitive: 2, alphaConcat: 1 },
  'components/SavedTicketsSummary.tsx': { rawRnPrimitive: 2, tinyArbitraryText: 3 },
  'components/TicketEmptyIllustration.tsx': { hexColor: 26 },
  'components/TicketStatusBadge.tsx': { rawRnPrimitive: 1, alphaConcat: 2 },
};

describe('design-debt ratchet (T11.06)', () => {
  const actual = scanDesignDebt(process.cwd() + '/src');

  it('adds no new design debt anywhere', () => {
    const regressions: string[] = [];
    for (const [file, counts] of Object.entries(actual)) {
      for (const [pattern, n] of Object.entries(counts)) {
        const allowed = ALLOWLIST[file]?.[pattern] ?? 0;
        if (n > allowed) regressions.push(`${file} ${pattern}: ${n} > ${allowed}`);
      }
    }
    expect(regressions).toEqual([]);
  });

  it('keeps the allowlist tight (lower it after paying down debt)', () => {
    const stale: string[] = [];
    for (const [file, counts] of Object.entries(ALLOWLIST)) {
      for (const [pattern, allowed] of Object.entries(counts)) {
        const n = actual[file]?.[pattern] ?? 0;
        if (n < allowed) stale.push(`${file} ${pattern}: lower ${allowed} -> ${n}`);
      }
    }
    expect(stale).toEqual([]);
  });

  it('detects each debt pattern (scanner self-test)', () => {
    const { DEBT_PATTERNS } = jest.requireActual('@/test-utils/designDebt');
    expect(DEBT_PATTERNS.rawRnPrimitive("import { View, Text } from 'react-native'")).toBe(1);
    expect(DEBT_PATTERNS.hexColor("color: '#FFFFFF'")).toBe(1);
    expect(DEBT_PATTERNS.alphaConcat('`${colors.primary}1A`')).toBe(1);
    expect(DEBT_PATTERNS.rawPaletteClass('bg-slate-50 dark:bg-slate-900')).toBe(2);
    expect(DEBT_PATTERNS.tinyArbitraryText('text-[10px]')).toBe(1);
    expect(DEBT_PATTERNS.textWhite('text-white font-bold')).toBe(1);
  });
});
