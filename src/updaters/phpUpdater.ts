import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for PHP projects.
 */
export class PHPUpdater implements UpdaterInterface {
  platform = 'php';
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
    this.manifestPath = this.manifestParser.detectManifest([
      'composer.json',
      'VERSION',
      'version.php',
      'config.php',
    ]);
    return this.manifestPath !== null;
  }

  /**
   * Gets the current version from the PHP manifest file.
   * @returns The current version or null if not found.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;

    switch (this.manifestPath) {
      case 'composer.json':
        return this.manifestParser.getVersion(this.manifestPath, 'json', {
          jsonPath: ['version'],
        });
      case 'VERSION':
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /^([\d.]+)$/m, // Matches the entire content as version
        });
      case 'version.php':
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /['"]([\d.]+)['']/, // Matches version in quotes
        });
      case 'config.php':
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /'version'\s*=>\s*'([\d.]+)'/, // Matches version in config array
        });
      default:
        return null;
    }
  }

  /**
   * Bumps the version in the PHP manifest file.
   * @param releaseType The type of release (patch, minor, major).
   * @returns The new version.
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('PHP manifest file not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('PHP version not found');

    const newVersion = calculateNextVersion(current, releaseType);

    switch (this.manifestPath) {
      case 'composer.json':
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
          jsonPath: ['version'],
        });
        break;
      case 'VERSION':
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /^([\d.]+)$/m,
        });
        break;
      case 'version.php':
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /(['"])([\d.]+)(['"])/,
        });
        break;
      case 'config.php':
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /('version'\s*=>\s*')([\d.]+)(')/,
        });
        break;
      default:
        throw new Error(`Unsupported PHP manifest file: ${this.manifestPath}`);
    }

    return newVersion;
  }
}
