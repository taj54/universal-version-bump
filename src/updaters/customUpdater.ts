import type { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface/updaterInterface';
import * as core from '@actions/core';
import { calculateNextVersion, FileHandler, ManifestParser } from '../utils';

export class CustomUpdater implements UpdaterInterface {
  platform = 'custom';
  private filePath: string;
  private variableName: string;
  private currentVersion: string | null = null;
  private fileHandler: FileHandler;
  private manifestParser: ManifestParser;

  constructor(filePath?: string | null, variableName?: string | null) {
    this.filePath = filePath || 'package.json';
    this.variableName = variableName || 'version';
    this.fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(this.fileHandler);
  }

  canHandle(): boolean {
    // This updater is explicitly called, so it can always handle if constructed.
    return true;
  }

  getCurrentVersion(): string | null {
    if (this.currentVersion) {
      return this.currentVersion;
    }

    try {
      // eslint-disable-next-line no-useless-escape
      const regex = new RegExp(`(${this.variableName}\s*=\s*['"]?)([\\d.]+)(['"]?)`);
      this.currentVersion = this.manifestParser.getVersion(this.filePath, 'regex', {
        regex: regex,
      });
      return this.currentVersion;
    } catch (error) {
      core.debug(`Could not read or parse version from ${this.filePath}: ${error}`);
    }
    return null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const oldVersion = this.getCurrentVersion();
    if (!oldVersion) {
      throw new Error(
        `Could not find current version for variable '${this.variableName}' in file '${this.filePath}'`,
      );
    }

    const newVersion = calculateNextVersion(oldVersion, releaseType);
    // eslint-disable-next-line no-useless-escape
    const regexReplace = new RegExp(`(${this.variableName}\s*=\s*['"]?)${oldVersion}(['"]?)`);

    this.manifestParser.updateVersion(this.filePath, newVersion, 'regex', {
      regexReplace: regexReplace,
    });

    core.info(
      `Bumped ${this.variableName} in ${this.filePath} from ${oldVersion} to ${newVersion}`,
    );
    return newVersion;
  }
}
