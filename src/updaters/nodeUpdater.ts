import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

export class NodeUpdater implements Updater {
  platform = 'node';

  canHandle(): boolean {
    return FileHandler.fileExists('package.json');
  }

  getCurrentVersion(): string | null {
    if (!this.canHandle()) return null;
    const pkg = JSON.parse(FileHandler.readFile('package.json'));
    return pkg.version;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const pkg = JSON.parse(FileHandler.readFile('package.json'));
    const newVersion = calculateNextVersion(pkg.version, releaseType);
    pkg.version = newVersion;
    FileHandler.writeFile('package.json', JSON.stringify(pkg, null, 2));
    return newVersion;
  }
}
