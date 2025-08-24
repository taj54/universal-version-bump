import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, ManifestParser } from '../utils';

export class NodeUpdater implements Updater {
  platform = 'node';
  private manifestPath: string | null = null;

  canHandle(): boolean {
    this.manifestPath = ManifestParser.detectManifest(['package.json']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return ManifestParser.getVersion(this.manifestPath, 'json', {
      jsonPath: ['version'],
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('package.json not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Node version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    ManifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
      jsonPath: ['version'],
    });

    return newVersion;
  }
}
