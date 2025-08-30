import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';

/**
 * Service for interacting with Git.
 */
export class GitService {
  constructor(private baseBranch: string = 'main') {}

  private async _execGitCommand(args: string[], options?: exec.ExecOptions): Promise<number> {
    return await exec.exec('git', args, options);
  }

  /**
   * Configures the Git user.
   */
  async configureGitUser(): Promise<void> {
    await this._execGitCommand(['config', 'user.name', 'github-actions[bot]']);
    await this._execGitCommand([
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
    await this._execGitCommand(['add', '-A']);
    try {
      await this._execGitCommand(['diff-index', '--quiet', 'HEAD']);
      core.info('⚠️ No changes to commit');
      return false;
    } catch {
      await this._execGitCommand(['commit', '-m', message]);
      return true;
    }
  }

  /**
   * Creates a release branch for the specified version.
   * @param version The version to create the branch for.
   * @returns The name of the created branch or null if no changes were made.
   */
  async createReleaseBranch(version: string): Promise<string | null> {
    const branch = `version-bump/v${version}`;
    await this._execGitCommand(['checkout', '-b', branch]);
    const committed = await this.commitChanges(`chore(release): bump version to v${version}`);
    if (!committed) {
      core.info('⚠️ Skipping branch push, no changes detected');
      return null;
    }
    await this._execGitCommand(['push', 'origin', branch, '--force']);
    return branch;
  }

  /**
   * Creates a Git tag for the specified version.
   * @param version The version to create the tag for.
   */
  async createAndPushTag(version: string): Promise<void> {
    await this._execGitCommand(['tag', `v${version}`]);
    await this._execGitCommand(['push', 'origin', 'HEAD', '--tags']);
  }

  /**
   * Get the latest git tag.
   * @returns The latest tag as a string.
   */
  async getLatestTag(): Promise<string> {
    let latestTag = '';
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          latestTag += data.toString();
        },
      },
      ignoreReturnCode: true,
    };
    const exitCode = await this._execGitCommand(['describe', '--tags', '--abbrev=0'], options);

    if (exitCode !== 0) {
      throw new Error('No tags found in the repository. Please create a tag first.');
    }

    return latestTag.trim();
  }

  /**
   * Get the commits since a specific tag.
   * @param tag The tag to get commits since.
   * @returns An array of commit messages.
   */
  async getCommitsSinceTag(tag: string): Promise<string[]> {
    let commits = '';
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          commits += data.toString();
        },
      },
    };
    await this._execGitCommand(['log', `${tag}..HEAD`, '--oneline'], options);
    return commits.split('\n').filter(Boolean);
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
      base: this.baseBranch,
      body: prBody,
    });

    return pr.html_url;
  }
}
