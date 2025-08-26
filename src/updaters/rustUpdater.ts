import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Rust projects.
 */
export class RustUpdater implements UpdaterInterface {
  platform = 'rust';
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
    this.manifestPath = this.manifestParser.detectManifest(['Cargo.toml']);
    return this.manifestPath !== null;
  }

  /**
   * Gets the current version from the Cargo.toml file.
   * @returns The current version or null if not found.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /version\s*=\s*"([^"]+)"/,
    });
  }

  /**
   * Bumps the version in the Cargo.toml file.
   * @param releaseType The type of release (patch, minor, major).
   * @returns The new version.
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Cargo.toml not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Rust version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace: /(version\s*=\s*")([^"]+)(")/,
    });

    return newVersion;
  }
}
