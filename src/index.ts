import * as core from '@actions/core';
import {
  detectPlatform,
  updateVersion,
  configureGitUser,
  commitChanges,
  createAndPushTag,
} from './utils';
import semver from 'semver';

async function run() {
  try {
    const releaseType = (core.getInput('release_type') || 'patch') as semver.ReleaseType;

    const platform = detectPlatform();
    core.info(`Detected platform: ${platform}`);

    const version = updateVersion(platform, releaseType);
    core.setOutput('new_version', version);

    // Git Commit & Tag
    await configureGitUser();
    await commitChanges(`chore: bump version to ${version}`);
    await createAndPushTag(version);
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
