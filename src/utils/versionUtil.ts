import semver, { ReleaseType } from 'semver';

export function calculateNextVersion(currentVersion: string, releaseType: ReleaseType): string {
  const newVersion = semver.inc(currentVersion, releaseType);
  if (!newVersion) {
    return currentVersion;
  }
  return newVersion;
}
