import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export const SETTINGS_STORAGE_KEY = 'dove.settings.v1';

export type DrawTableOrder = 'g8_to_special' | 'special_to_g8';

export interface AppSettings {
  celebrationEnabled: boolean;
  hapticsEnabled: boolean;
  themeMode: 'system' | 'light' | 'dark';
  reminderEnabled: boolean;
  autoSubmitEnabled: boolean;
  drawTableOrder: DrawTableOrder;
}

const DEFAULT_SETTINGS: AppSettings = {
  celebrationEnabled: true,
  hapticsEnabled: true,
  themeMode: 'system',
  reminderEnabled: false,
  autoSubmitEnabled: true,
  drawTableOrder: 'g8_to_special',
};

let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };
let isInitialized = false;
const listeners = new Set<(settings: AppSettings) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentSettings));
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Keep defaults on read error
  } finally {
    isInitialized = true;
    notifyListeners();
  }
  return currentSettings;
}

/**
 * Pure snapshot getter for useSyncExternalStore (T09.49).
 * Contains no side-effects or async bootstrap calls.
 */
export function getSettings(): AppSettings {
  return currentSettings;
}

export function isSettingsInitialized(): boolean {
  return isInitialized;
}

export function updateSettings(partial: Partial<AppSettings>): void {
  currentSettings = { ...currentSettings, ...partial };
  notifyListeners();
  AsyncStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(currentSettings),
  ).catch(() => {});
}

export function resetSettings(): void {
  currentSettings = { ...DEFAULT_SETTINGS };
  notifyListeners();
  AsyncStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(currentSettings),
  ).catch(() => {});
}

export function subscribeSettings(
  listener: (settings: AppSettings) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSettings(): [
  AppSettings,
  (partial: Partial<AppSettings>) => void,
] {
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettings,
    getSettings,
  );
  return [settings, updateSettings];
}
