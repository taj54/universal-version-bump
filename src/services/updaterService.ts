import semver from 'semver';
import { Updater } from '../interface';
import { PlatformDetectionError, VersionBumpError } from '../errors';

export class UpdaterService {
  private updaters: Updater[];

  constructor(updaters: Updater[]) {
    this.updaters = updaters;
  }

  detectPlatform(): string {
    const updater = this.updaters.find((u) => u.canHandle());
    if (!updater) {
      throw new PlatformDetectionError('Could not detect platform.');
    }
    return updater.platform;
  }

  updateVersion(platform: string, releaseType: semver.ReleaseType): string {
    const updater = this.updaters.find((u) => u.platform === platform);
    if (!updater) {
      throw new VersionBumpError(`No updater found for platform: ${platform}`);
    }
    return updater.bumpVersion(releaseType);
  }
}
