import semver from 'semver';
import { PlatformDetectionError, VersionBumpError } from '../errors';
import { UpdaterRegistry } from '../registry/updaterRegistry';

export class UpdaterService {
  private updaterRegistry: UpdaterRegistry;

  constructor(updaterRegistry: UpdaterRegistry) {
    this.updaterRegistry = updaterRegistry;
  }

  getPlatform(targetPlatform?: string): string {
    if (targetPlatform) {
      const updater = this.updaterRegistry.getUpdater(targetPlatform);
      if (!updater) {
        throw new PlatformDetectionError(
          `Specified platform "${targetPlatform}" is not supported.`,
        );
      }
      return updater.platform;
    }

    const detectedUpdater = this.updaterRegistry.getAllUpdaters().find((u) => u.canHandle());
    if (!detectedUpdater) {
      throw new PlatformDetectionError(
        'Could not detect platform. Please specify target_platform input if auto-detection fails.',
      );
    }
    return detectedUpdater.platform;
  }

  updateVersion(platform: string, releaseType: semver.ReleaseType): string {
    const updater = this.updaterRegistry.getUpdater(platform);
    if (!updater) {
      throw new VersionBumpError(`No updater found for platform: ${platform}`);
    }
    return updater.bumpVersion(releaseType);
  }
}
