import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Dockerfiles.
 */
export class DockerUpdater implements UpdaterInterface {
  platform = 'docker';
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
    this.manifestPath = this.manifestParser.detectManifest(['Dockerfile']);
    return this.manifestPath !== null;
  }

  /**
   * Gets the current version from the Dockerfile.
   * @returns The current version or null if not found.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /LABEL version="([^"]+)"/,
    });
  }

  /**
   * Bumps the version in the Dockerfile.
   * @param releaseType The type of release (patch, minor, major).
   * @returns The new version.
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Dockerfile not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Docker version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace: /(LABEL\s+version=")([^"]+)(")/,
    });

    return newVersion;
  }
}
