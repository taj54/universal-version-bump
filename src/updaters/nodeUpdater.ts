import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

export class NodeUpdater implements UpdaterInterface {
  platform = 'node';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;

  constructor() {
    const fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(fileHandler);
  }

  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['package.json']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'json', {
      jsonPath: ['version'],
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('package.json not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Node version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
      jsonPath: ['version'],
    });

    return newVersion;
  }
}
