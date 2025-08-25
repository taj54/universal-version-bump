import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

export class GoUpdater implements UpdaterInterface {
  platform = 'go';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;

  constructor() {
    const fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(fileHandler);
  }

  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['go.mod']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /^module\s+[^\s]+\s+v?(\d+\.\d+\.\d+)/m,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('go.mod not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Go version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, `v${newVersion}`, 'regex', {
      regexReplace: /v\d+\.\d+\.\d+/,
    });

    return newVersion;
  }
}
