import semver from 'semver';
import { VersionBumpError } from '../errors';
import { CustomUpdater } from '../updaters';

/**
 * Service for handling custom version updates.
 */
export class CustomUpdaterService {
  /**
   * Updates the version for the specified bump targets.
   * @param releaseType The type of release (major, minor, patch).
   * @param bumpTargets The targets to bump.
   * @returns The new version string.
   */
  updateCustomVersions(
    releaseType: semver.ReleaseType,
    bumpTargets: Array<{ path: string; variable: string }>,
  ): string {
    if (bumpTargets.length === 0) {
      throw new VersionBumpError('No bump_targets provided for custom platform.');
    }
    let lastBumpedVersion: string = '';
    for (const target of bumpTargets) {
      if (!target.path || !target.variable) {
        throw new VersionBumpError('Invalid bump_target provided for custom platform.');
      }
      const lastPath = target.path.split('/').pop();
      console.log(lastPath);
      const customUpdater = new CustomUpdater(target.path, target.variable);
      lastBumpedVersion = customUpdater.bumpVersion(releaseType);
    }
    return lastBumpedVersion;
  }
}
