import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';

export class GitService {
  async configureGitUser(): Promise<void> {
    await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
    await exec.exec('git', [
      'config',
      'user.email',
      'github-actions[bot]@users.noreply.github.com',
    ]);
  }

  async commitChanges(message: string): Promise<boolean> {
    await exec.exec('git', ['add', '-A']);
    try {
      await exec.exec('git', ['diff-index', '--quiet', 'HEAD']);
      core.info('⚠️ No changes to commit');
      return false;
    } catch {
      await exec.exec('git', ['commit', '-m', message]);
      return true;
    }
  }

  async createReleaseBranch(version: string): Promise<string | null> {
    const branch = `version/v${version}`;
    await exec.exec('git', ['checkout', '-b', branch]);
    const committed = await this.commitChanges(`chore(release): bump version to v${version}`);
    if (!committed) {
      core.info('⚠️ Skipping branch push, no changes detected');
      return null;
    }
    await exec.exec('git', ['push', 'origin', branch, '--force']);
    return branch;
  }

  async createAndPushTag(version: string): Promise<void> {
    await exec.exec('git', ['tag', `v${version}`]);
    await exec.exec('git', ['push', 'origin', 'HEAD', '--tags']);
  }

  async createPullRequest(branch: string, version: string) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('❌ GITHUB_TOKEN not found in environment');
    }

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    const prTitle = `chore(release): bump version to v${version}`;
    const prBody = `This PR bumps the version to **v${version}** 🚀`;

    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: prTitle,
      head: branch,
      base: 'main',
      body: prBody,
    });

    return pr.html_url;
  }
}
