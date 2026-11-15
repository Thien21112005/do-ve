import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSettings,
  updateSettings,
  resetSettings,
  subscribeSettings,
} from '../settings';

describe('Settings store', () => {
  beforeEach(() => {
    resetSettings();
  });

  it('has sensible defaults: celebration and haptics enabled', () => {
    const settings = getSettings();
    expect(settings.celebrationEnabled).toBe(true);
    expect(settings.hapticsEnabled).toBe(true);
    expect(settings.themeMode).toBe('system');
  });

  it('updates settings and notifies subscribers', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeSettings(listener);

    updateSettings({ celebrationEnabled: false });

    expect(getSettings().celebrationEnabled).toBe(false);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ celebrationEnabled: false }),
    );

    unsubscribe();
  });

  it('can reset to defaults', () => {
    updateSettings({ celebrationEnabled: false, hapticsEnabled: false });
    expect(getSettings().celebrationEnabled).toBe(false);

    resetSettings();
    expect(getSettings().celebrationEnabled).toBe(true);
    expect(getSettings().hapticsEnabled).toBe(true);
  });

  it('getSettings is a pure snapshot getter without side-effects (T09.49)', () => {
    let isolatedGetSettings!: typeof getSettings;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('../settings');
      isolatedGetSettings = mod.getSettings;
    });

    const getItemSpy = jest.spyOn(AsyncStorage, 'getItem');
    getItemSpy.mockClear();

    // On fresh uninitialized module, calling getSettings must not trigger AsyncStorage.getItem
    isolatedGetSettings();
    isolatedGetSettings();

    expect(getItemSpy).not.toHaveBeenCalled();
  });
});
