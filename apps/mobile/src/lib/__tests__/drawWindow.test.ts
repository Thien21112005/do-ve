import { DRAW_WINDOW, toMinutes, hourLabel, DRAW_DONE_LABEL } from '../drawWindow';
import { STRINGS } from '../strings';
import { isLiveDrawingVN } from '../date';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

describe('DRAW_WINDOW single source (T11.20)', () => {
  it('converts times', () => {
    expect(toMinutes('16:40')).toBe(1000);
    expect(hourLabel('16:15')).toBe('16h15');
    expect(hourLabel('16:00')).toBe('16h');
  });

  it('window is ordered liveFrom <= start < expectedDone', () => {
    expect(toMinutes(DRAW_WINDOW.liveFrom)).toBeLessThanOrEqual(toMinutes(DRAW_WINDOW.start));
    expect(toMinutes(DRAW_WINDOW.start)).toBeLessThan(toMinutes(DRAW_WINDOW.expectedDone));
  });

  it('pending copy uses the expected-done time', () => {
    expect(STRINGS.check.resultPendingSubtitle).toContain(DRAW_DONE_LABEL);
  });

  it('live window follows the constant', () => {
    const vn = (hhmm: string) => new Date(`2026-11-16T${hhmm}:00+07:00`);
    expect(isLiveDrawingVN(vn('16:09'))).toBe(false);
    expect(isLiveDrawingVN(vn(DRAW_WINDOW.liveFrom))).toBe(true);
    expect(isLiveDrawingVN(vn(DRAW_WINDOW.expectedDone))).toBe(true);
    expect(isLiveDrawingVN(vn('16:41'))).toBe(false);
  });

  it('no other draw time is hard-coded in app code or copy', () => {
    const files = [
      'src/lib/strings.ts',
      'src/lib/format.ts',
      'src/lib/date.ts',
      'src/components/DateStrip.tsx',
      'src/components/ResultCard.tsx',
      'src/app/(tabs)/index.tsx',
    ];
    for (const f of files) {
      const src: string = fs.readFileSync(path.join(process.cwd(), f), 'utf8');
      // allowed: the reminder at 16h45 (a separate notification setting)
      const hits = (src.match(/16h(?:1[05]|3[05]|40)|16 \* 60 \+ \d+|\b1000\b(?! \*)/g) ?? []);
      expect({ file: f, hits }).toEqual({ file: f, hits: [] });
    }
  });
});
