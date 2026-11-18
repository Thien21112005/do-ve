import { motion, radii, elevations } from '../tokens';

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

function walkTsFiles(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'test-utils') {
        walkTsFiles(full, out);
      }
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
}

describe('Design Tokens & Restrained Motion System (T10.59 / T11.49)', () => {
  it('defines strictly 3 standard durations (120ms press, 200ms segmented, 320ms stub reveal)', () => {
    expect(Object.keys(motion.duration)).toEqual(['fast', 'normal', 'slow']);
    expect(motion.duration.fast).toBe(120);
    expect(motion.duration.normal).toBe(200);
    expect(motion.duration.slow).toBe(320);
  });

  it('defines 2 standard easings (out-quart & spring)', () => {
    expect(motion.easing.outQuart).toEqual([0.25, 1, 0.5, 1]);
    expect(motion.easing.spring).toEqual({
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    });
  });

  it('maintains disciplined radii and elevations', () => {
    expect(radii.sm).toBe(8);
    expect(radii.md).toBe(12);
    expect(radii.lg).toBe(16);

    expect(elevations.none.elevation).toBe(0);
    expect(elevations.sheet.elevation).toBe(8);
    expect(elevations.toast.elevation).toBe(10);
  });

  it('removes CelebrationEffect confetti/emoji overlay and forbids raw numeric animation durations (T11.49)', () => {
    const srcDir = path.join(process.cwd(), 'src');
    expect(
      fs.existsSync(path.join(srcDir, 'components', 'CelebrationEffect.tsx')),
    ).toBe(false);

    const files: string[] = [];
    walkTsFiles(srcDir, files);

    const rawDurationOffenders: string[] = [];
    for (const file of files) {
      const rel = path.relative(srcDir, file).replace(/\\/g, '/');
      if (rel === 'theme/tokens.ts') continue;
      const content = fs.readFileSync(file, 'utf8');
      if (/duration\s*:\s*\d+/.test(content)) {
        rawDurationOffenders.push(rel);
      }
    }
    expect(rawDurationOffenders).toEqual([]);

    const resultStubSrc = fs.readFileSync(
      path.join(srcDir, 'components', 'ResultStub.tsx'),
      'utf8',
    );
    expect(resultStubSrc).toContain('motion.duration.slow');
  });
});
