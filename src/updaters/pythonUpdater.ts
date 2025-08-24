import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, ManifestParser } from '../utils';

export class PythonUpdater implements Updater {
  platform = 'python';
  private manifestPath: string | null = null;

  canHandle(): boolean {
    this.manifestPath = ManifestParser.detectManifest(['pyproject.toml', 'setup.py']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;

    switch (this.manifestPath) {
      case 'pyproject.toml':
        return ManifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /version\s*=\s*"([^"]+)"/,
        });
      case 'setup.py':
        return ManifestParser.getVersion(this.manifestPath, 'regex', {
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
        ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /version\s*=\s*"[^"]+"/,
        });
        break;
      case 'setup.py':
        ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /version\s*=\s*["'][^"']+["']/, // Matches single or double quotes
        });
        break;
      default:
        throw new Error(`Unsupported Python manifest file: ${this.manifestPath}`);
    }

    return newVersion;
  }
}
