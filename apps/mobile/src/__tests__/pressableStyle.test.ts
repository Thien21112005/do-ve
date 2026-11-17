// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/**
 * NativeWind's css-interop wraps Pressable; a style *function*
 * (`style={({ pressed }) => …}`) is dropped on device, so rows lose
 * flexDirection/padding (seen on More/Settings after T11.01).
 * Use usePressed() from components/ui instead.
 */
function walk(dir: string, out: string[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== '__tests__') walk(full, out);
    } else if (/\.tsx$/.test(e.name)) out.push(full);
  }
}

describe('no function styles on Pressable', () => {
  it('src contains no style={({ pressed }) => …}', () => {
    const files: string[] = [];
    walk(path.join(process.cwd(), 'src'), files);
    const offenders = files.filter((f) =>
      /style=\{\(\{\s*pressed/.test(fs.readFileSync(f, 'utf8')),
    );
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });
});
