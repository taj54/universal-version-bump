import semver from 'semver';
import { PlatformDetectionError, VersionBumpError } from '../errors';
import { UpdaterRegistry } from '../registry/updaterRegistry';
import { CustomUpdater } from '../updaters/customUpdater';

/**
 * Service for managing version updates.
 */
export class UpdaterService {
  private updaterRegistry: UpdaterRegistry;

  /**
   * Creates an instance of the UpdaterService.
   * @param updaterRegistry The registry of updaters.
   */
  constructor(updaterRegistry: UpdaterRegistry) {
    this.updaterRegistry = updaterRegistry;
  }

  /**
   * Get the platform for the specified target platform.
   * @param targetPlatform The target platform to get.
   * @returns The platform string.
   */
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

  /**
   * Update the version for the specified platform and release type.
   * @param platform The platform to update.
   * @param releaseType The type of release (major, minor, patch).
   * @returns The new version string.
   */
  updateVersion(
    platform: string,
    releaseType: semver.ReleaseType,
    bumpTargets: Array<{ path: string; variable: string }> = [],
  ): string {
    if (platform === 'custom') {
      if (bumpTargets.length === 0) {
        throw new VersionBumpError('No bump_targets provided for custom platform.');
      }
      let lastBumpedVersion: string = '';
      for (const target of bumpTargets) {
        const customUpdater = new CustomUpdater(target.path, target.variable);
        lastBumpedVersion = customUpdater.bumpVersion(releaseType);
      }
      return lastBumpedVersion;
    } else {
      const updater = this.updaterRegistry.getUpdater(platform);
      if (!updater) {
        throw new VersionBumpError(`No updater found for platform: ${platform}`);
      }
      return updater.bumpVersion(releaseType);
    }
  }
}
