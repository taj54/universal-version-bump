import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

export class RustUpdater implements Updater {
  platform = 'rust';

  canHandle(): boolean {
    return FileHandler.fileExists('Cargo.toml');
  }

  getCurrentVersion(): string | null {
    if (!this.canHandle()) return null;
    const content = FileHandler.readFile('Cargo.toml');
    const match = content.match(/version\s*=\s*"([^"]+)"/);
    return match ? match[1] : null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Rust version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    let content = FileHandler.readFile('Cargo.toml');
    content = content.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
    FileHandler.writeFile('Cargo.toml', content);

    return newVersion;
  }
}
