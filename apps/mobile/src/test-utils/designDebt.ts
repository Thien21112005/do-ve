/**
 * Design-debt scanner used by designGuard.test.ts (T11.06).
 * Counts patterns that bypass the design system in screens/components.
 */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

export const DEBT_PATTERNS: Record<string, (src: string) => number> = {
  // Raw RN Text / TouchableOpacity instead of @/components/ui primitives
  rawRnPrimitive: (src) => {
    const imports = src.match(/import\s*\{[^}]*\}\s*from\s*'react-native'/g) ?? [];
    return imports.reduce(
      (n: number, imp: string) =>
        n + (/\bText\b/.test(imp) ? 1 : 0) + (/\bTouchableOpacity\b/.test(imp) ? 1 : 0),
      0,
    );
  },
  hexColor: (src) => (src.match(/['"]#[0-9a-fA-F]{3,8}['"]/g) ?? []).length,
  alphaConcat: (src) => (src.match(/\}[0-9a-fA-F]{2}`/g) ?? []).length,
  rawPaletteClass: (src) =>
    (src.match(/\b(?:slate|red|blue|green|amber)-\d{2,3}\b/g) ?? []).length,
  tinyArbitraryText: (src) => (src.match(/text-\[1[01]px\]/g) ?? []).length,
  textWhite: (src) => (src.match(/\btext-white\b/g) ?? []).length,
};

export type DebtCounts = Record<string, Record<string, number>>;

function walk(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === '__fixtures__') continue;
      walk(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
}

/** Returns non-zero debt counts keyed by path relative to src/. */
export function scanDesignDebt(srcRoot: string): DebtCounts {
  const files: string[] = [];
  walk(path.join(srcRoot, 'app'), files);
  walk(path.join(srcRoot, 'components'), files);
  const result: DebtCounts = {};
  for (const file of files) {
    const rel = path.relative(srcRoot, file).split(path.sep).join('/');
    if (rel.startsWith('components/ui/')) continue;
    const src = fs.readFileSync(file, 'utf8');
    const counts: Record<string, number> = {};
    for (const [name, count] of Object.entries(DEBT_PATTERNS)) {
      const n = count(src);
      if (n > 0) counts[name] = n;
    }
    if (Object.keys(counts).length > 0) result[rel] = counts;
  }
  return result;
}
