import semver from 'semver';
import { Updater } from '../interface';

export class UpdaterService {
  private updaters: Updater[];

  constructor(updaters: Updater[]) {
    this.updaters = updaters;
  }

  detectPlatform(): string {
    const updater = this.updaters.find((u) => u.canHandle());
    return updater ? updater.platform : 'unknown';
  }

  updateVersion(platform: string, releaseType: semver.ReleaseType): string {
    const updater = this.updaters.find((u) => u.platform === platform);
    if (!updater) {
      throw new Error(`No updater found for platform: ${platform}`);
    }
    return updater.bumpVersion(releaseType);
  }
}
