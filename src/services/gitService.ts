import * as exec from '@actions/exec';

export class GitService {
  async configureGitUser(): Promise<void> {
    await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
    await exec.exec('git', [
      'config',
      'user.email',
      'github-actions[bot]@users.noreply.github.com',
    ]);
  }

  async commitChanges(message: string): Promise<void> {
    await exec.exec('git', ['add', '-A']);
    try {
      await exec.exec('git', ['diff-index', '--quiet', 'HEAD']);
    } catch (error) {
      // Only commit if there are changes
      await exec.exec('git', ['commit', '-m', message]);
    }
  }

  async createAndPushTag(version: string): Promise<void> {
    await exec.exec('git', ['tag', `v${version}`]);
    await exec.exec('git', ['push', 'origin', 'HEAD', '--tags']);
  }
}
