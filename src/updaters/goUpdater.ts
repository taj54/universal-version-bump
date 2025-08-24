import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

export class GoUpdater implements Updater {
  platform = 'go';

  canHandle(): boolean {
    return FileHandler.fileExists('go.mod');
  }

  getCurrentVersion(): string | null {
    if (!this.canHandle()) return null;
    const content = FileHandler.readFile('go.mod');
    const match = content.match(/module\s+.*\n.*v(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Go version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    let content = FileHandler.readFile('go.mod');
    content = content.replace(/v\d+\.\d+\.\d+/, `v${newVersion}`);
    FileHandler.writeFile('go.mod', content);

    return newVersion;
  }
}
