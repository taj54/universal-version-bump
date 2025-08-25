import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

export class PythonUpdater implements UpdaterInterface {
  platform = 'python';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;

  constructor() {
    const fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(fileHandler);
  }

  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['pyproject.toml', 'setup.py']);
    return this.manifestPath !== null;
  }

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
