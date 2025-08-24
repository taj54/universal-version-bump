import { UpdaterService, GitService } from './services';
import {
  DockerUpdater,
  GoUpdater,
  NodeUpdater,
  PHPUpdater,
  PythonUpdater,
  RustUpdater,
} from './updaters';
import { UpdaterRegistry } from './registry';
import {
  PlatformDetectionError,
  VersionBumpError,
  FileNotFoundError,
  InvalidManifestError,
} from './errors';
import { RELEASE_TYPE, TARGET_PLATFORM, GIT_TAG, TARGET_PATH } from './config';
import * as core from '@actions/core';

async function run() {
  try {
    process.chdir(TARGET_PATH);
    const releaseType = RELEASE_TYPE;
    const targetPlatform = TARGET_PLATFORM;

    const updaterRegistry = new UpdaterRegistry();
    updaterRegistry.registerUpdater(new NodeUpdater());
    updaterRegistry.registerUpdater(new PythonUpdater());
    updaterRegistry.registerUpdater(new RustUpdater());
    updaterRegistry.registerUpdater(new GoUpdater());
    updaterRegistry.registerUpdater(new DockerUpdater());
    updaterRegistry.registerUpdater(new PHPUpdater());

    const updaterService = new UpdaterService(updaterRegistry);
    const gitService = new GitService();

    const platform = updaterService.getPlatform(targetPlatform);
    core.info(`Detected platform: ${platform}`);

    const version = updaterService.updateVersion(platform, releaseType);
    core.setOutput('new_version', version);

    // Git Commit & Tag
    const gitTag = GIT_TAG;
    await gitService.configureGitUser();
    const branch = await gitService.createReleaseBranch(version);
    if (branch) {
      core.info(`✅ Created branch: ${branch}`);
      const prUrl = await gitService.createPullRequest(branch, version);
      core.info(`✅ PR created: ${prUrl}`);
    }
    if (gitTag) {
      await gitService.createAndPushTag(version);
    }
  } catch (error: unknown) {
    if (error instanceof PlatformDetectionError) {
      core.setFailed(`Platform detection failed: ${error.message}`);
    } else if (error instanceof VersionBumpError) {
      core.setFailed(`Version bump failed: ${error.message}`);
    } else if (error instanceof FileNotFoundError) {
      core.setFailed(`File not found: ${error.message}`);
    } else if (error instanceof InvalidManifestError) {
      core.setFailed(`Invalid manifest: ${error.message}`);
    } else if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
