/**
 * Semantic version comparison utility
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

export const CURRENT_APP_VERSION = '1.0.0';

