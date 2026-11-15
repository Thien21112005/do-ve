// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

function getPngDimensions(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  // PNG magic header: 89 50 4E 47 0D 0A 1A 0A
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height, size: buffer.length };
}

describe('DoVe Mobile App Icon Assets (T10.15)', () => {
  const assetsDir = path.resolve(process.cwd(), 'assets/images');

  it('provides 1024x1024 primary app icon', () => {
    const iconPath = path.join(assetsDir, 'icon.png');
    expect(fs.existsSync(iconPath)).toBe(true);
    const { width, height } = getPngDimensions(iconPath);
    expect(width).toBe(1024);
    expect(height).toBe(1024);
  });

  it('provides Android 13+ adaptive icon set (background, foreground, monochrome)', () => {
    const bgPath = path.join(assetsDir, 'android-icon-background.png');
    const fgPath = path.join(assetsDir, 'android-icon-foreground.png');
    const monoPath = path.join(assetsDir, 'android-icon-monochrome.png');

    for (const p of [bgPath, fgPath, monoPath]) {
      expect(fs.existsSync(p)).toBe(true);
      const { width, height } = getPngDimensions(p);
      expect(width).toBe(1024);
      expect(height).toBe(1024);
    }
  });

  it('provides 48x48 web favicon', () => {
    const faviconPath = path.join(assetsDir, 'favicon.png');
    expect(fs.existsSync(faviconPath)).toBe(true);
    const { width, height } = getPngDimensions(faviconPath);
    expect(width).toBe(48);
    expect(height).toBe(48);
  });
});
