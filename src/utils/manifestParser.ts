import { FileHandler } from './fileHandler';

export class ManifestParser {
  static detectManifest(manifestNames: string[]): string | null {
    for (const name of manifestNames) {
      if (FileHandler.fileExists(name)) {
        return name;
      }
    }
    return null;
  }

  static getVersion(
    manifestPath: string,
    type: 'json' | 'regex',
    options: { regex?: RegExp; jsonPath?: string[] },
  ): string | null {
    const content = FileHandler.readFile(manifestPath);

    if (type === 'json') {
      const data = JSON.parse(content);
      let version = data;
      if (options.jsonPath) {
        for (const key of options.jsonPath) {
          if (version && typeof version === 'object' && key in version) {
            version = version[key];
          } else {
            return null; // Path not found
          }
        }
      }
      return typeof version === 'string' ? version : null;
    } else if (type === 'regex' && options.regex) {
      const match = content.match(options.regex);
      return match ? match[1] : null;
    }
    return null;
  }

  static updateVersion(
    manifestPath: string,
    newVersion: string,
    type: 'json' | 'regex',
    options: { regexReplace?: RegExp; jsonPath?: string[] },
  ): void {
    let content = FileHandler.readFile(manifestPath);

    if (type === 'json') {
      const data = JSON.parse(content);
      let target = data;
      if (options.jsonPath && options.jsonPath.length > 0) {
        for (let i = 0; i < options.jsonPath.length - 1; i++) {
          const key = options.jsonPath[i];
          if (target && typeof target === 'object' && key in target) {
            target = target[key];
          } else {
            // Path not found, or not an object, cannot update
            return;
          }
        }
        const lastKey = options.jsonPath[options.jsonPath.length - 1];
        if (target && typeof target === 'object' && lastKey in target) {
          target[lastKey] = newVersion;
        }
      } else {
        // If no jsonPath, assume the root is the version (e.g., a simple string file)
        // This case might not be directly handled by JSON.parse, but for completeness
        // if the JSON itself was just a version string, it would be `data = newVersion`
        // For typical JSON, jsonPath will always be present.
      }
      FileHandler.writeFile(manifestPath, JSON.stringify(data, null, 2));
    } else if (type === 'regex' && options.regexReplace) {
      content = content.replace(options.regexReplace, newVersion);
      FileHandler.writeFile(manifestPath, content);
    }
  }
}
