import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Node.js projects using package.json.
 */
export class NodeUpdater implements UpdaterInterface {
  platform = 'node';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;
  private fileHandler: FileHandler;

  constructor() {
    this.fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(this.fileHandler);
  }

  /**
   * Checks if the updater can handle the current repository.
   * @returns True if the updater can handle the repo, false otherwise.
   */
  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['package.json']);
    return this.manifestPath !== null;
  }

  /**
   * Gets the current version from the package.json file.
   * @returns The current version or null if not found.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'json', {
      jsonPath: ['version'],
    });
  }

  /**
   * Bumps the version in the package.json file.
   * @param releaseType The type of release (patch, minor, major).
   * @returns The new version.
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('package.json not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Node version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
      jsonPath: ['version'],
    });

    // Also bump deno.json/jsr.json if present to keep versions in sync
    const extraManifests = ['deno.json', 'jsr.json'];
    for (const manifest of extraManifests) {
      if (this.fileHandler.fileExists(manifest)) {
        this.manifestParser.updateVersion(manifest, newVersion, 'json', { jsonPath: ['version'] });
      }
    }

    return newVersion;
  }
}
