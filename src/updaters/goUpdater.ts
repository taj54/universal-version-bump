import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Go modules.
 */
export class GoUpdater implements UpdaterInterface {
  platform = 'go';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;

  constructor() {
    const fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(fileHandler);
  }

  /**
   * Checks if the updater can handle the current repository.
   * @returns True if the updater can handle the repo, false otherwise.
   */
  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['go.mod']);
    return this.manifestPath !== null;
  }

  /**
   * Gets the current version from the go.mod file.
   * @returns The current version or null if not found.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /^module\s+[^\s]+\s+v?(\d+\.\d+\.\d+)/m,
    });
  }

  /**
   * Bumps the version in the go.mod file.
   * @param releaseType The type of release (patch, minor, major).
   * @returns The new version.
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('go.mod not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Go version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, `v${newVersion}`, 'regex', {
      regexReplace: /v\d+\.\d+\.\d+/,
    });

    return newVersion;
  }
}
