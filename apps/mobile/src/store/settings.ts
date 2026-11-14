import { useSyncExternalStore } from 'react';

export interface AppSettings {
  celebrationEnabled: boolean;
  hapticsEnabled: boolean;
  themeMode: 'system' | 'light' | 'dark';
}

const DEFAULT_SETTINGS: AppSettings = {
  celebrationEnabled: true,
  hapticsEnabled: true,
  themeMode: 'system',
};

let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<(settings: AppSettings) => void>();

export function getSettings(): AppSettings {
  return currentSettings;
}

export function updateSettings(partial: Partial<AppSettings>): void {
  currentSettings = { ...currentSettings, ...partial };
  listeners.forEach((listener) => listener(currentSettings));
}

export function resetSettings(): void {
  currentSettings = { ...DEFAULT_SETTINGS };
  listeners.forEach((listener) => listener(currentSettings));
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
