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
import { RELEASE_TYPE, TARGET_PLATFORM, GIT_TAG } from './config';
import * as core from '@actions/core';

async function run() {
  try {
    const releaseType = RELEASE_TYPE;
    const targetPlatform = TARGET_PLATFORM;

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
    const gitTag = GIT_TAG;
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
