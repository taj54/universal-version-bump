import { UpdaterService, GitService, ChangelogService } from './services';
import { FileHandler, safeParseJSON } from './utils';
import { UpdaterRegistry } from './registry';
import {
  PlatformDetectionError,
  VersionBumpError,
  FileNotFoundError,
  InvalidManifestError,
} from './errors';
import { RELEASE_TYPE, TARGET_PLATFORM, GIT_TAG, TARGET_PATH, BUMP_TARGETS } from './config';
import * as core from '@actions/core';

async function initializeServices() {
  const updaterRegistry = new UpdaterRegistry();
  await updaterRegistry.loadUpdaters();
  const updaterService = new UpdaterService(updaterRegistry);
  const gitService = new GitService('main');
  const fileHandler = new FileHandler();
  const changelogService = new ChangelogService(fileHandler, gitService, 'CHANGELOG.md');
  return {
    updaterRegistry,
    updaterService,
    gitService,
    fileHandler,
    changelogService,
  };
}

async function run() {
  try {
    process.chdir(TARGET_PATH);
    const releaseType = RELEASE_TYPE;
    const targetPlatform = TARGET_PLATFORM;

    const { updaterService, gitService, changelogService } = await initializeServices();

    const platform = updaterService.getPlatform(targetPlatform);
    core.info(`Detected platform: ${platform}`);

    const bumpTargets = safeParseJSON(BUMP_TARGETS);
    core.info(`Bump targets: ${bumpTargets.length > 0 ? bumpTargets.join(', ') : 'All'}`);
    const version = updaterService.updateVersion(platform, releaseType);
    core.setOutput('new_version', version);

    // Generate and update changelog
    const latestTag = await gitService.getLatestTag();
    const commits = await gitService.getCommitsSinceTag(latestTag);
    const changelogContent = changelogService.generateChangelog(commits, version);
    await changelogService.updateChangelog(changelogContent);

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
    handleError(error);
  }
}

function handleError(error: unknown) {
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

run();
