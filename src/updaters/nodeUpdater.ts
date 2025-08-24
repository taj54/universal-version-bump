import fs from 'fs';
import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion } from '../utils';

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
    const newVersion = calculateNextVersion(pkg.version, releaseType);
    pkg.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    return newVersion;
  }
}
