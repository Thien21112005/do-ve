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

  it('provides branded splash-icon and light/dark theme colors in app.json (T10.16)', () => {
    const splashPath = path.join(assetsDir, 'splash-icon.png');
    expect(fs.existsSync(splashPath)).toBe(true);
    const { width, height } = getPngDimensions(splashPath);
    expect(width).toBe(512);
    expect(height).toBe(512);

    const appJsonPath = path.resolve(process.cwd(), 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    // Check light & dark background match Direction A tokens
    expect(appJson.expo.splash.backgroundColor).toBe('#F6F4EF');
    expect(appJson.expo.splash.dark?.backgroundColor).toBe('#0F1217');
  });

  it('removes unused Expo template assets (T10.17)', () => {
    const obsoleteAssets = [
      'react-logo.png',
      'react-logo@2x.png',
      'react-logo@3x.png',
      'expo-badge.png',
      'expo-badge-white.png',
      'expo-logo.png',
      'logo-glow.png',
      'tutorial-web.png',
      'tabIcons',
    ];

    for (const item of obsoleteAssets) {
      expect(fs.existsSync(path.join(assetsDir, item))).toBe(false);
    }

    const expoIconDir = path.resolve(process.cwd(), 'assets/expo.icon');
    expect(fs.existsSync(expoIconDir)).toBe(false);
  });
});
