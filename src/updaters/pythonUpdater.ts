import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Python projects.
 */
export class PythonUpdater implements UpdaterInterface {
  platform = 'python';
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
    this.manifestPath = this.manifestParser.detectManifest(['pyproject.toml', 'setup.py']);
    return this.manifestPath !== null;
  }

  /**
   * Gets the current version from the Python manifest file.
   * @returns The current version or null if not found.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;

    switch (this.manifestPath) {
      case 'pyproject.toml':
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /version\s*=\s*"([^"]+)"/,
        });
      case 'setup.py':
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /version\s*=\s*["']([^"']+)["']/, // Matches single or double quotes
        });
      default:
        return null;
    }
  }

  /**
   * Bumps the version in the Python manifest file.
   * @param releaseType The type of release (patch, minor, major).
   * @returns The new version.
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Python manifest file not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Python version not found');

    const newVersion = calculateNextVersion(current, releaseType);

    switch (this.manifestPath) {
      case 'pyproject.toml':
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /(version\s*=\s*")([^"]+)(")/,
        });
        break;
      case 'setup.py':
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /(version\s*=\s*["'])([^"']+)(["'])/,
        });
        break;
      default:
        throw new Error(`Unsupported Python manifest file: ${this.manifestPath}`);
    }

    return newVersion;
  }
}
