import * as core from '@actions/core';
import semver from 'semver';

export const RELEASE_TYPE = (core.getInput('release_type') || 'patch') as semver.ReleaseType;
export const TARGET_PLATFORM = core.getInput('target_platform');
export const GIT_TAG = core.getInput('git_tag') === 'true';
