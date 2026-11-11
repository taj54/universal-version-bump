import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

/**
 * Updater for .NET project files and shared build properties.
 */
export class DotNetUpdater implements UpdaterInterface {
  platform = 'dotnet';
  private manifestPath: string | null = null;
  private fileHandler: FileHandler;

  constructor() {
    this.fileHandler = new FileHandler();
  }

  canHandle(): boolean {
    if (this.fileHandler.fileExists('Directory.Build.props')) {
      this.manifestPath = 'Directory.Build.props';
      return true;
    }

    const projectFiles = this.fileHandler
      .readDir('.')
      .filter((name) => /\.(cs|fs|vb)proj$/i.test(name))
      .sort();
    this.manifestPath = projectFiles[0] ?? null;
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    const match = this.getVersionMatch(this.fileHandler.readFile(this.manifestPath));
    return match?.[2].trim() ?? null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('.NET manifest file not found');
    const content = this.fileHandler.readFile(this.manifestPath);
    const match = this.getVersionMatch(content);
    if (!match) throw new Error('.NET version not found');

    const current = match[2].trim();
    const newVersion = calculateNextVersion(current, releaseType);
    const versionStart = match.index + match[0].indexOf(match[2]);
    this.fileHandler.writeFile(
      this.manifestPath,
      content.slice(0, versionStart) + newVersion + content.slice(versionStart + match[2].length),
    );
    return newVersion;
  }

  private getVersionMatch(content: string): RegExpExecArray | null {
    return /<(Version|VersionPrefix|PackageVersion)\b[^>]*>\s*([^<]+?)\s*<\/\1\s*>/i.exec(content);
  }
}
