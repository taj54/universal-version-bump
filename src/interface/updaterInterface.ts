import type { ReleaseType } from 'semver';

export interface UpdaterInterface {
  /** Name of the platform/language */
  platform: string;

  /** Detect if this updater can handle the current repo */
  canHandle(): boolean;

  /** Get current version from manifest */
  getCurrentVersion(): string | null;

  /** Increment version and persist the change */
  bumpVersion(releaseType: ReleaseType): string;
}
