import {
  compareVersions,
  isVersionOutdated,
  getAppVersion,
  getBuildNumber,
  CURRENT_APP_VERSION,
  CURRENT_BUILD_NUMBER,
} from '../version';

describe('Version comparison utilities', () => {
  describe('compareVersions', () => {
    it('returns 0 for equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('2.1.3', '2.1.3')).toBe(0);
    });

    it('returns 1 when v1 is greater than v2', () => {
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(compareVersions('1.1.0', '1.0.9')).toBe(1);
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
    });

    it('returns -1 when v1 is less than v2', () => {
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(compareVersions('1.0.9', '1.1.0')).toBe(-1);
      expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
    });

    it('handles versions with different number of segments', () => {
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.1', '1.0')).toBe(1);
      expect(compareVersions('1.0', '1.0.1')).toBe(-1);
    });
  });

  describe('isVersionOutdated', () => {
    it('returns false when current is equal to or greater than minimum', () => {
      expect(isVersionOutdated('1.0.0', '1.0.0')).toBe(false);
      expect(isVersionOutdated('1.1.0', '1.0.0')).toBe(false);
      expect(isVersionOutdated('2.0.0', '1.5.0')).toBe(false);
    });

    it('returns true when current is strictly less than minimum', () => {
      expect(isVersionOutdated('1.0.0', '1.0.1')).toBe(true);
      expect(isVersionOutdated('1.0.0', '1.1.0')).toBe(true);
      expect(isVersionOutdated('1.2.0', '2.0.0')).toBe(true);
    });
  });

  describe('Native config version reading (T09.56)', () => {
    it('reads app version from native Expo config', () => {
      expect(getAppVersion()).toBe('1.0.0');
      expect(CURRENT_APP_VERSION).toBeTruthy();
    });

    it('reads build number dynamically from platform config', () => {
      const build = getBuildNumber();
      expect(build).toBeTruthy();
      expect(CURRENT_BUILD_NUMBER).toBe(build);
    });
  });
});

