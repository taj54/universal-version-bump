import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, ManifestParser } from '../utils';

export class GoUpdater implements Updater {
  platform = 'go';
  private manifestPath: string | null = null;

  canHandle(): boolean {
    this.manifestPath = ManifestParser.detectManifest(['go.mod']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return ManifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /module\s+.*\n.*v(\d+\.\d+\.\d+)/,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('go.mod not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Go version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    ManifestParser.updateVersion(this.manifestPath, `v${newVersion}`, 'regex', {
      regexReplace: /v\d+\.\d+\.\d+/,
    });

    return newVersion;
  }
}
