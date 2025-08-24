import * as core from '@actions/core';
import semver from 'semver';
import { UpdaterService, GitService } from './services';
import {
  DockerUpdater,
  GoUpdater,
  NodeUpdater,
  PHPUpdater,
  PythonUpdater,
  RustUpdater,
} from './updaters';
import { PlatformDetectionError, VersionBumpError } from './errors';

async function run() {
  try {
    const releaseType = (core.getInput('release_type') || 'patch') as semver.ReleaseType;
    const targetPlatform = core.getInput('target_platform');

    const updaters = [
      new NodeUpdater(),
      new PythonUpdater(),
      new RustUpdater(),
      new GoUpdater(),
      new DockerUpdater(),
      new PHPUpdater(),
    ];
    const updaterService = new UpdaterService(updaters);
    const gitService = new GitService();

    const platform = updaterService.getPlatform(targetPlatform);
    core.info(`Detected platform: ${platform}`);

    const version = updaterService.updateVersion(platform, releaseType);
    core.setOutput('new_version', version);

    // Git Commit & Tag
    const gitTag = core.getInput('git_tag') === 'true';
    await gitService.configureGitUser();
    await gitService.commitChanges(`chore: bump version to ${version}`);
    if (gitTag) {
      await gitService.createAndPushTag(version);
    }
  } catch (error: unknown) {
    if (error instanceof PlatformDetectionError) {
      core.setFailed(`Platform detection failed: ${error.message}`);
    } else if (error instanceof VersionBumpError) {
      core.setFailed(`Version bump failed: ${error.message}`);
    } else if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
