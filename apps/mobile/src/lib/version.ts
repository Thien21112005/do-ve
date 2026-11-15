/**
 * Semantic version comparison utility & native runtime version resolver (T09.56)
 * Reads version and build number directly from native Expo configuration.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Returns 1 if v1 > v2, -1 if v1 < v2, and 0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = (v1 || '').split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = (v2 || '').split('.').map((p) => parseInt(p, 10) || 0);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Checks if current app version is strictly lower than minimum supported version
 */
export function isVersionOutdated(
  currentVersion: string,
  minSupportedVersion: string,
): boolean {
  if (!minSupportedVersion) return false;
  return compareVersions(currentVersion, minSupportedVersion) < 0;
}

/**
 * Read app version dynamically from native Expo config (T09.56)
 */
export function getAppVersion(): string {
  return (
    Constants.expoConfig?.version ||
    (Constants.manifest as any)?.version ||
    '1.0.0'
  );
}

/**
 * Read native build number dynamically from Expo config (T09.56)
 */
export function getBuildNumber(): string {
  const iosBuild = Constants.expoConfig?.ios?.buildNumber;
  const androidCode = Constants.expoConfig?.android?.versionCode;

  if (Platform.OS === 'ios' && iosBuild) {
    return String(iosBuild);
  }
  if (Platform.OS === 'android' && androidCode !== undefined) {
    return String(androidCode);
  }
  return String(androidCode ?? iosBuild ?? '1');
}

export const CURRENT_APP_VERSION = getAppVersion();
export const CURRENT_BUILD_NUMBER = getBuildNumber();
