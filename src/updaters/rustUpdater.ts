import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, ManifestParser } from '../utils';

export class RustUpdater implements Updater {
  platform = 'rust';
  private manifestPath: string | null = null;

  canHandle(): boolean {
    this.manifestPath = ManifestParser.detectManifest(['Cargo.toml']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return ManifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /version\s*=\s*"([^"]+)"/,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Cargo.toml not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Rust version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    ManifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace: /version\s*=\s*"[^"]+"/,
    });

    return newVersion;
  }
}
