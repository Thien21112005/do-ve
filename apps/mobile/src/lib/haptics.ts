import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { getSettings } from '@/store/settings';

/**
 * Check whether haptics are supported and enabled by user settings (T09.46 / T10.60)
 */
function canTriggerHaptics(): boolean {
  if (Platform.OS === 'web') return false;
  return getSettings().hapticsEnabled;
}

export const haptics = {
  selection: async () => {
    if (!canTriggerHaptics()) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore haptics failure gracefully
    }
  },

  light: async () => {
    if (!canTriggerHaptics()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore haptics failure gracefully
    }
  },

  medium: async () => {
    if (!canTriggerHaptics()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore haptics failure gracefully
    }
  },

  success: async () => {
    if (!canTriggerHaptics()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore haptics failure gracefully
    }
  },

  warning: async () => {
    if (!canTriggerHaptics()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore haptics failure gracefully
    }
  },

  error: async () => {
    if (!canTriggerHaptics()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore haptics failure gracefully
    }
  },
};
