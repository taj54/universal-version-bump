import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

/**
 * Updater for the Deno ecosystem.
 *
 * Supports `deno.json` and `jsr.json` manifests. Detection reads from the first
 * manifest found; bumping writes the computed version to all present manifests
 * to keep them in sync.
 */
export class DenoUpdater implements UpdaterInterface {
  platform = 'deno';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;
  private fileHandler: FileHandler;

  constructor() {
    this.fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(this.fileHandler);
  }

  /**
   * Returns true when `deno.json` or `jsr.json` exists at the repo root.
   * Stores the detected manifest path for subsequent operations.
   */
  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest(['deno.json', 'jsr.json']);
    return this.manifestPath !== null;
  }

  /**
   * Reads the `version` from the detected manifest.
   */
  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;
    return this.manifestParser.getVersion(this.manifestPath, 'json', { jsonPath: ['version'] });
  }

  /**
   * Calculates the next semver from the detected manifest, then writes the new
   * version to `deno.json` and `jsr.json` (only those that exist).
   */
  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('deno.json/jsr.json not found');

    const current = this.getCurrentVersion();
    if (!current) throw new Error('Deno/JSR version not found');

    const newVersion = calculateNextVersion(current, releaseType);

    const manifests = ['deno.json', 'jsr.json'];
    for (const manifest of manifests) {
      if (this.fileHandler.fileExists(manifest)) {
        this.manifestParser.updateVersion(manifest, newVersion, 'json', { jsonPath: ['version'] });
      }
    }

    return newVersion;
  }
}
