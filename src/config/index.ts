import * as core from '@actions/core';
import semver from 'semver';
import { safeParseJSON } from '../utils';

export const RELEASE_TYPE = (core.getInput('release_type') || 'patch') as semver.ReleaseType;
export const TARGET_PLATFORM = core.getInput('target_platform');
export const GIT_TAG = core.getInput('git_tag') === 'true';
export const TARGET_PATH = core.getInput('target_path') || '.';
export const CHANGELOG_PATH = core.getInput('changelog_path') || 'CHANGELOG.md';
export const CHANGELOG_MODE = core.getInput('changelog_mode') || 'auto';
export const BUMP_TARGETS = safeParseJSON<{ path: string; variable: string }[]>(
  core.getInput('bump_targets'),
);
