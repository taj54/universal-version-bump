import * as exec from '@actions/exec';

export async function configureGitUser() {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
}

export async function commitChanges(message: string) {
  await exec.exec('git', ['add', '-A']);
  try {
    await exec.exec('git', ['diff-index', '--quiet', 'HEAD']);
  } catch (error) {
    // Only commit if there are changes
    await exec.exec('git', ['commit', '-m', message]);
  }
}

export async function createAndPushTag(version: string) {
  await exec.exec('git', ['tag', `v${version}`]);
  await exec.exec('git', ['push', 'origin', 'HEAD', '--tags']);
}
