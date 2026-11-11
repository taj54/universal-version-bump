import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for Dart and Flutter projects using pubspec.yaml.
 */
export class DartUpdater implements UpdaterInterface {
  platform = 'dart';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;

  constructor() {
    const fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(fileHandler);
  }

  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['pubspec.yaml']);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /^version:\s*['"]?([^#\s'"]+)['"]?\s*(?:#.*)?$/m,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('pubspec.yaml not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Dart version not found');

    const newVersion = calculateNextVersion(current, releaseType);
    this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
      regexReplace: /^(\s*version:\s*['"]?)([^#\s'"]+)(['"]?\s*(?:#.*)?)$/m,
    });
    return newVersion;
  }
}
