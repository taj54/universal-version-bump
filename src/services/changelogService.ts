import * as exec from '@actions/exec';
import { FileHandler } from '../utils/fileHandler';

/**
 * Service for managing the changelog file.
 */
export class ChangelogService {
  constructor(private fileHandler: FileHandler) {}

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
    };
    await exec.exec('git', ['describe', '--tags', '--abbrev=0'], options);
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
    await exec.exec('git', ['log', `${tag}..HEAD`, '--oneline'], options);
    return commits.split('\n').filter(Boolean);
  }

  /**
   * Generate a changelog from the given commits.
   * @param commits The list of commits to include in the changelog.
   * @param newVersion The new version number.
   * @returns The generated changelog as a string.
   */
  generateChangelog(commits: string[], newVersion: string): string {
    const changelogDate = new Date().toISOString().split('T')[0];
    let changelogContent = `## v${newVersion} ${changelogDate}\n\n`;
    const categorizedCommits: { [key: string]: string[] } = { Added: [], Changed: [], Fixed: [] };
    for (const commit of commits) {
      const commitMessage = commit.split(' ').slice(1).join(' ');
      const messageParts = commitMessage.split(':');
      const message =
        messageParts.length > 1 ? messageParts.slice(1).join(':').trim() : commitMessage;
      if (commitMessage.startsWith('feat') || commitMessage.startsWith('Added')) {
        categorizedCommits.Added.push(`- ${message}`);
      } else if (commitMessage.startsWith('fix') || commitMessage.startsWith('Fixed')) {
        categorizedCommits.Fixed.push(`- ${message}`);
      } else {
        categorizedCommits.Changed.push(`- ${message}`);
      }
    }
    for (const category in categorizedCommits) {
      if (categorizedCommits[category].length > 0) {
        changelogContent += `### ${category}\n\n`;
        changelogContent += categorizedCommits[category].join('\n') + '\n\n';
      }
    }
    return changelogContent;
  }

  /**
   * Update the changelog file with the new content.
   * @param changelogContent The new changelog content to add.
   */
  async updateChangelog(changelogContent: string): Promise<void> {
    const changelogPath = 'CHANGELOG.md';
    const existingChangelog = await this.fileHandler.readFile(changelogPath);
    const versionMatch = changelogContent.match(/## v(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      const newVersion = versionMatch[0];
      if (existingChangelog.includes(newVersion)) {
        console.log(`Changelog for version ${newVersion} already exists. Skipping.`);
        return;
      }
    }

    const separator = '\n---\n\n';
    const headerIndex = existingChangelog.indexOf(separator);

    if (headerIndex !== -1) {
      const header = existingChangelog.substring(0, headerIndex + separator.length);
      const restOfChangelog = existingChangelog.substring(headerIndex + separator.length);
      const newChangelog = header + changelogContent + restOfChangelog;
      await this.fileHandler.writeFile(changelogPath, newChangelog);
    } else {
      const newChangelog = changelogContent + existingChangelog;
      await this.fileHandler.writeFile(changelogPath, newChangelog);
    }
  }
}
