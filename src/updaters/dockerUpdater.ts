import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

export class DockerUpdater implements Updater {
  platform = 'docker';

  canHandle(): boolean {
    return FileHandler.fileExists('Dockerfile');
  }

  getCurrentVersion(): string | null {
    const content = FileHandler.readFile('Dockerfile');
    const match = content.match(/LABEL version="([^"]+)"/);
    return match ? match[1] : null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Docker version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    let content = FileHandler.readFile('Dockerfile');
    content = content.replace(/LABEL version="[^"]+"/, `LABEL version="${newVersion}"`);
    FileHandler.writeFile('Dockerfile', content);

    return newVersion;
  }
}
