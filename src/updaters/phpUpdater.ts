import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, ManifestParser } from '../utils';

export class PHPUpdater implements Updater {
  platform = 'php';
  private manifestPath: string | null = null;

  canHandle(): boolean {
    this.manifestPath = ManifestParser.detectManifest([
      'composer.json',
      'VERSION',
      'version.php',
      'config.php',
    ]);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;

    switch (this.manifestPath) {
      case 'composer.json':
        return ManifestParser.getVersion(this.manifestPath, 'json', {
          jsonPath: ['version'],
        });
      case 'VERSION':
        return ManifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /^([\d.]+)$/m, // Matches the entire content as version
        });
      case 'version.php':
        return ManifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /['"]([\d.]+)['']/, // Matches version in quotes
        });
      case 'config.php':
        return ManifestParser.getVersion(this.manifestPath, 'regex', {
          regex: /'version'\s*=>\s*'([\d.]+)'/, // Matches version in config array
        });
      default:
        return null;
    }
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('PHP manifest file not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('PHP version not found');

    const newVersion = calculateNextVersion(current, releaseType);

    switch (this.manifestPath) {
      case 'composer.json':
        ManifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
          jsonPath: ['version'],
        });
        break;
      case 'VERSION':
        ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /^([\d.]+)$/m,
        });
        break;
      case 'version.php':
        ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /(['"])[\d.]+(['"])/,
        });
        break;
      case 'config.php':
        ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
          regexReplace: /'version'\s*=>\s*'[\d.]+'/, // Matches version in config array
        });
        break;
      default:
        throw new Error(`Unsupported PHP manifest file: ${this.manifestPath}`);
    }

    return newVersion;
  }
}
