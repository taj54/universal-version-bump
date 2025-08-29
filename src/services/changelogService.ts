import { FileHandler } from '../utils/fileHandler';
import { GitService } from './gitService';
import * as core from '@actions/core';
import { FileNotFoundError } from '../errors';

/**
 * Service for managing the changelog file.
 */
export class ChangelogService {
  constructor(
    private fileHandler: FileHandler,
    private gitService: GitService,
    private changelogPath: string = 'CHANGELOG.md',
  ) {}

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
    const changelogPath = this._getChangelogPath();
    let existingChangelog: string;
    try {
      existingChangelog = await this.fileHandler.readFile(changelogPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new FileNotFoundError(
          `Changelog file not found at ${changelogPath}`,
        );
      }
      throw error;
    }

    const versionMatch = changelogContent.match(/## v(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      const newVersion = versionMatch[0];
      if (this._versionExistsInChangelog(existingChangelog, newVersion)) {
        core.info(`Changelog for version ${newVersion} already exists. Skipping.`);
        return;
      }
    }

    const updatedChangelog = this._insertChangelogContent(existingChangelog, changelogContent);
    await this.fileHandler.writeFile(changelogPath, updatedChangelog);
  }

  private _getChangelogPath(): string {
    return this.changelogPath;
  }

  private _versionExistsInChangelog(existingChangelog: string, newVersion: string): boolean {
    return existingChangelog.includes(newVersion);
  }

  private _insertChangelogContent(existingChangelog: string, changelogContent: string): string {
    const separator = '\n---\n\n';
    const headerIndex = existingChangelog.indexOf(separator);

    if (headerIndex !== -1) {
      const header = existingChangelog.substring(0, headerIndex + separator.length);
      const contentAfterHeader = existingChangelog.substring(headerIndex + separator.length);
      const firstVersionIndex = contentAfterHeader.search(/## v\d+\.\d+\.\d+/);

      if (firstVersionIndex !== -1) {
        const oldChangelog = contentAfterHeader.substring(firstVersionIndex);
        return header + changelogContent + oldChangelog;
      } else {
        // No version found after header, so just append the new changelog
        return header + changelogContent;
      }
    } else {
      // No separator found, so prepend the new changelog
      return changelogContent + existingChangelog;
    }
  }
}
