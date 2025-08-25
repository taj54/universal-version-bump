import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

export class RustUpdater implements UpdaterInterface {
  platform = 'rust';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;

  constructor() {
    const fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(fileHandler);
  }

  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['Cargo.toml']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /version\s*=\s*"([^"]+)"/,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Cargo.toml not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Rust version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace: /(version\s*=\s*")([^"]+)(")/,
    });

    return newVersion;
  }
}
