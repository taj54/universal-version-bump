import semver, { ReleaseType } from 'semver';

/**
 * Calculates the next version based on the current version and release type.
 * @param currentVersion The current version string.
 * @param releaseType The type of release (patch, minor, major).
 * @returns The new version string.
 */
export function calculateNextVersion(currentVersion: string, releaseType: ReleaseType): string {
  const newVersion = semver.inc(currentVersion, releaseType);
  if (!newVersion) {
    return currentVersion;
  }
  return newVersion;
}
