import fs from 'fs';
import semver, { ReleaseType } from 'semver';
import { Updater } from '../interface';

export class NodeUpdater implements Updater {
  platform = 'node';

  canHandle(): boolean {
    return fs.existsSync('package.json');
  }

  getCurrentVersion(): string | null {
    if (!this.canHandle()) return null;
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg.version;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const newVersion = semver.inc(pkg.version, releaseType) || pkg.version;
    pkg.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    return newVersion;
  }
}
