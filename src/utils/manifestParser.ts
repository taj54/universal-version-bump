import { FileHandler } from './fileHandler';
import { InvalidManifestError } from '../errors';

/**
 * Utility class for parsing and updating manifest files.
 */
export class ManifestParser {
  private fileHandler: FileHandler;

  constructor(fileHandler: FileHandler) {
    this.fileHandler = fileHandler;
  }

  /**
   * Detects the presence of a manifest file.
   * @param manifestNames The names of the manifest files to check.
   * @returns The path to the manifest file if found, null otherwise.
   */
  detectManifest(manifestNames: string[]): string | null {
    for (const name of manifestNames) {
      if (this.fileHandler.fileExists(name)) {
        return name;
      }
    }
    return null;
  }

  /**
   * Gets the version from a manifest file.
   * @param manifestPath The path to the manifest file.
   * @param type The type of manifest (json or regex).
   * @param options Options for extracting the version.
   * @returns The version string or null if not found.
   */
  getVersion(
    manifestPath: string,
    type: 'json' | 'regex',
    options: { regex?: RegExp; jsonPath?: string[] },
  ): string | null {
    const content = this.fileHandler.readFile(manifestPath);

    if (type === 'json') {
      let data: unknown;
      try {
        data = JSON.parse(content);
      } catch (e: unknown) {
        throw new InvalidManifestError(
          `Invalid JSON in ${manifestPath}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      let version: unknown = data;
      if (options.jsonPath) {
        for (const key of options.jsonPath) {
          if (typeof version === 'object' && version !== null && key in version) {
            version = (version as Record<string, unknown>)[key];
          } else {
            throw new InvalidManifestError(
              `JSON path '${options.jsonPath.join('.')}' not found in ${manifestPath}`,
            );
          }
        }
      }
      return typeof version === 'string' ? version : null;
    } else if (type === 'regex' && options.regex) {
      const match = content.match(options.regex);
      if (!match) {
        throw new InvalidManifestError(
          `Regex '${options.regex.source}' did not find a match in ${manifestPath}`,
        );
      }
      return match[1];
    }
    return null;
  }

  /**
   * Updates the version in a manifest file.
   * @param manifestPath The path to the manifest file.
   * @param newVersion The new version to set.
   * @param type The type of manifest (json or regex).
   * @param options Options for updating the version.
   */
  updateVersion(
    manifestPath: string,
    newVersion: string,
    type: 'json' | 'regex',
    options: { regexReplace?: RegExp; jsonPath?: string[] },
  ): void {
    let content = this.fileHandler.readFile(manifestPath);

    if (type === 'json') {
      let data: unknown;
      try {
        data = JSON.parse(content);
      } catch (e: unknown) {
        throw new InvalidManifestError(
          `Invalid JSON in ${manifestPath}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      let target: unknown = data;
      if (options.jsonPath && options.jsonPath.length > 0) {
        for (let i = 0; i < options.jsonPath.length - 1; i++) {
          const key = options.jsonPath[i];
          if (typeof target === 'object' && target !== null && key in target) {
            target = (target as Record<string, unknown>)[key];
          } else {
            throw new InvalidManifestError(
              `JSON path '${options.jsonPath.slice(0, i + 1).join('.')}' not found for update in ${manifestPath}`,
            );
          }
        }
        const lastKey = options.jsonPath[options.jsonPath.length - 1];
        if (typeof target === 'object' && target !== null && lastKey in target) {
          (target as Record<string, unknown>)[lastKey] = newVersion;
        } else {
          throw new InvalidManifestError(
            `JSON path '${options.jsonPath.join('.')}' not found for update in ${manifestPath}`,
          );
        }
      } else {
        // If no jsonPath, assume the root is the version (e.g., a simple string file)
        // This case might not be directly handled by JSON.parse, but for completeness
        // if the JSON itself was just a version string, it would be `data = newVersion`
        // For typical JSON, jsonPath will always be present.
      }
      this.fileHandler.writeFile(manifestPath, JSON.stringify(data, null, 2));
    } else if (type === 'regex' && options.regexReplace) {
      content = content.replace(options.regexReplace, (_match, prefix, _oldVersion, suffix) => {
        return `${prefix}${newVersion}${suffix}`;
      });
      this.fileHandler.writeFile(manifestPath, content);
    }
  }
}
