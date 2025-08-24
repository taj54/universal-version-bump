import fs from 'fs';
import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion } from '../utils';

export class DockerUpdater implements Updater {
  platform = 'docker';

  canHandle(): boolean {
    return fs.existsSync('Dockerfile');
  }

  getCurrentVersion(): string | null {
    const content = fs.readFileSync('Dockerfile', 'utf8');
    const match = content.match(/LABEL version="([^"]+)"/);
    return match ? match[1] : null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Docker version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    let content = fs.readFileSync('Dockerfile', 'utf8');
    content = content.replace(/LABEL version="[^"]+"/, `LABEL version="${newVersion}"`);
    fs.writeFileSync('Dockerfile', content);

    return newVersion;
  }
}
