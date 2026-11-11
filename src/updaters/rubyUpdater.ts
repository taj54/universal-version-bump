import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Ruby gems with a literal version in a gemspec or version.rb.
 */
export class RubyUpdater implements UpdaterInterface {
  platform = 'ruby';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;
  private fileHandler: FileHandler;

  constructor() {
    this.fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(this.fileHandler);
  }

  canHandle(): boolean {
    const gemspec = this.fileHandler
      .readDir('.')
      .filter((name) => name.endsWith('.gemspec'))
      .sort()[0];
    this.manifestPath =
      gemspec ?? (this.fileHandler.fileExists('version.rb') ? 'version.rb' : null);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex:
        this.manifestPath === 'version.rb'
          ? /\bVERSION\s*=\s*['"]([^'"]+)['"]/
          : /\b\w+\.version\s*=\s*['"]([^'"]+)['"]/,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Ruby manifest file not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Ruby version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace:
        this.manifestPath === 'version.rb'
          ? /(\bVERSION\s*=\s*['"])([^'"]+)(['"])/
          : /(\b\w+\.version\s*=\s*['"])([^'"]+)(['"])/,
    });
    return newVersion;
  }
}
