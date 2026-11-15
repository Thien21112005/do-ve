import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { haptics } from '../haptics';
import { updateSettings, resetSettings } from '@/store/settings';

describe('haptics helper (T09.46 / T10.60)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettings();
    Platform.OS = 'ios';
  });

  describe('when hapticsEnabled is true', () => {
    it('triggers impactAsync with Light style for haptics.light', async () => {
      await haptics.light();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('triggers impactAsync with Medium style for haptics.medium', async () => {
      await haptics.medium();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('triggers notificationAsync with Success for haptics.success', async () => {
      await haptics.success();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });

    it('triggers notificationAsync with Warning for haptics.warning', async () => {
      await haptics.warning();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
    });

    it('triggers notificationAsync with Error for haptics.error', async () => {
      await haptics.error();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
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

    it('does NOT trigger any haptics when disabled in settings', async () => {
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
});
