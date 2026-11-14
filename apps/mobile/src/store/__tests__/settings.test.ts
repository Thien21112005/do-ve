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
});
