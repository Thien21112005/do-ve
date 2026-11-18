import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { haptics } from '../haptics';
import { updateSettings, resetSettings } from '@/store/settings';

describe('haptics helper (T09.46 / T10.60 / T11.49)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettings();
    Platform.OS = 'ios';
  });

  describe('when hapticsEnabled is true', () => {
    it('triggers impactAsync with Light style for haptics.light', async () => {
      await haptics.light();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it('triggers impactAsync with Medium style for haptics.medium', async () => {
      await haptics.medium();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });

    it('triggers notificationAsync with Success for haptics.success', async () => {
      await haptics.success();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it('triggers notificationAsync with Warning for haptics.warning', async () => {
      await haptics.warning();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning,
      );
    });

    it('triggers notificationAsync with Error for haptics.error', async () => {
      await haptics.error();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });

    it('triggers selectionAsync for haptics.selection', async () => {
      await haptics.selection();
      expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('when hapticsEnabled is false in settings', () => {
    beforeEach(() => {
      updateSettings({ hapticsEnabled: false });
    });

    it('does NOT trigger any haptics on iOS when disabled in settings', async () => {
      Platform.OS = 'ios';
      await haptics.light();
      await haptics.medium();
      await haptics.success();
      await haptics.warning();
      await haptics.error();
      await haptics.selection();

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    });

    it('does NOT trigger any haptics on Android when disabled in settings (T11.49)', async () => {
      Platform.OS = 'android';
      await haptics.light();
      await haptics.medium();
      await haptics.success();
      await haptics.warning();
      await haptics.error();
      await haptics.selection();

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    });
  });

  describe('when running on web platform', () => {
    it('skips all haptics calls', async () => {
      Platform.OS = 'web';
      await haptics.light();
      await haptics.success();
      await haptics.selection();

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    });
  });

  describe('centralized haptics enforcement across codebase (T11.49)', () => {
    it('ensures no file outside src/lib/haptics.ts imports expo-haptics or RN Vibration directly', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const srcDir = path.join(process.cwd(), 'src');
      const offenders: string[] = [];

      function scan(dir: string) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== '__tests__') scan(full);
          } else if (/\.(ts|tsx)$/.test(entry.name)) {
            const rel = path.relative(srcDir, full).replace(/\\/g, '/');
            if (rel === 'lib/haptics.ts') continue;
            const content = fs.readFileSync(full, 'utf8');
            if (
              /from\s+['"]expo-haptics['"]/.test(content) ||
              /\bVibration\b/.test(content)
            ) {
              offenders.push(rel);
            }
          }
        }
      }

      scan(srcDir);
      expect(offenders).toEqual([]);
    });
  });
});
