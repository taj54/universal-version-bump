import fs from 'fs';
import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion } from '../utils';

export class GoUpdater implements Updater {
  platform = 'go';

  canHandle(): boolean {
    return fs.existsSync('go.mod');
  }

  getCurrentVersion(): string | null {
    if (!this.canHandle()) return null;
    const content = fs.readFileSync('go.mod', 'utf8');
    const match = content.match(/module\s+.*\n.*v(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Go version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    let content = fs.readFileSync('go.mod', 'utf8');
    content = content.replace(/v\d+\.\d+\.\d+/, `v${newVersion}`);
    fs.writeFileSync('go.mod', content);

    return newVersion;
  }
}
