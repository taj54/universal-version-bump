import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';

/**
 * Service for interacting with Git.
 */
export class GitService {
  /**
   * Configures the Git user.
   */
  async configureGitUser(): Promise<void> {
    await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
    await exec.exec('git', [
      'config',
      'user.email',
      'github-actions[bot]@users.noreply.github.com',
    ]);
  }

  /**
   * Commits the changes with the specified commit message.
   * @param message The commit message.
   * @returns True if changes were committed, false otherwise.
   */
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

  /**
   * Creates a release branch for the specified version.
   * @param version The version to create the branch for.
   * @returns The name of the created branch or null if no changes were made.
   */
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

  /**
   * Creates a Git tag for the specified version.
   * @param version The version to create the tag for.
   */
  async createAndPushTag(version: string): Promise<void> {
    await exec.exec('git', ['tag', `v${version}`]);
    await exec.exec('git', ['push', 'origin', 'HEAD', '--tags']);
  }

  /**
   * Creates a pull request for the specified branch and version.
   * @param branch The branch to create the pull request for.
   * @param version The version to include in the pull request.
   * @returns The URL of the created pull request.
   */
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
