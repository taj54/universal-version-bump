import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, ManifestParser } from '../utils';

export class DockerUpdater implements Updater {
  platform = 'docker';
  private manifestPath: string | null = null;

  canHandle(): boolean {
    this.manifestPath = ManifestParser.detectManifest(['Dockerfile']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return ManifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /LABEL version="([^"]+)"/,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Dockerfile not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Docker version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace: /LABEL version="[^"]+"/,
    });

    return newVersion;
  }
}
