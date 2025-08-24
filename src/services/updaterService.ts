import semver from 'semver';
import { Updater } from '../interface';
import { PlatformDetectionError, VersionBumpError } from '../errors';

export class UpdaterService {
  private updaters: Updater[];

  constructor(updaters: Updater[]) {
    this.updaters = updaters;
  }

  getPlatform(targetPlatform?: string): string {
    if (targetPlatform) {
      const updater = this.updaters.find((u) => u.platform === targetPlatform);
      if (!updater) {
        throw new PlatformDetectionError(`Specified platform "${targetPlatform}" is not supported.`);
      }
      return updater.platform;
    }

    const detectedUpdater = this.updaters.find((u) => u.canHandle());
    if (!detectedUpdater) {
      throw new PlatformDetectionError('Could not detect platform. Please specify target_platform input if auto-detection fails.');
    }
    return detectedUpdater.platform;
  }

  updateVersion(platform: string, releaseType: semver.ReleaseType): string {
    const updater = this.updaters.find((u) => u.platform === platform);
    if (!updater) {
      throw new VersionBumpError(`No updater found for platform: ${platform}`);
    }
    return updater.bumpVersion(releaseType);
  }
}
