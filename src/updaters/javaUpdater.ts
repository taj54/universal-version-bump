import { ReleaseType } from 'semver';
import { UpdaterInterface } from '../interface';
import { calculateNextVersion, ManifestParser, FileHandler } from '../utils';

type VersionLocation = { start: number; end: number; value: string };

/**
 * Updater for Java projects using Maven or Gradle.
 */
export class JavaUpdater implements UpdaterInterface {
  platform = 'java';
  private manifestPath: string | null = null;
  private manifestParser: ManifestParser;
  private fileHandler: FileHandler;

  constructor() {
    this.fileHandler = new FileHandler();
    this.manifestParser = new ManifestParser(this.fileHandler);
  }

  canHandle(): boolean {
    this.manifestPath = this.manifestParser.detectManifest([
      'pom.xml',
      'build.gradle',
      'build.gradle.kts',
    ]);
    return this.manifestPath !== null;
  }

  getCurrentVersion(): string | null {
    if (!this.manifestPath) return null;

    if (this.manifestPath === 'pom.xml') {
      return this.getMavenVersion(this.fileHandler.readFile(this.manifestPath))?.value ?? null;
    }

    return this.manifestParser.getVersion(this.manifestPath, 'regex', {
      regex: /^\s*version\s*(?:=\s*)?['"]([^'"]+)['"]/m,
    });
  }

  bumpVersion(releaseType: ReleaseType): string {
    if (!this.manifestPath) throw new Error('Java manifest file not found');
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Java version not found');

    const newVersion = calculateNextVersion(current, releaseType);

    if (this.manifestPath === 'pom.xml') {
      const content = this.fileHandler.readFile(this.manifestPath);
      const location = this.getMavenVersion(content);
      if (!location) throw new Error('Maven project version not found');
      this.fileHandler.writeFile(
        this.manifestPath,
        content.slice(0, location.start) + newVersion + content.slice(location.end),
      );
    } else {
      this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
        regexReplace: /^(\s*version\s*(?:=\s*)?['"])([^'"]+)(['"])/m,
      });
    }

    return newVersion;
  }

  private getMavenVersion(content: string): VersionLocation | null {
    const projectOpen = /<project\b[^>]*>/i.exec(content);
    if (!projectOpen || projectOpen.index === undefined) return null;

    const innerStart = projectOpen.index + projectOpen[0].length;
    const projectClose = content.indexOf('</project>', innerStart);
    if (projectClose === -1) return null;

    const inner = content.slice(innerStart, projectClose);
    const tagRegex = /<!--[\s\S]*?-->|<\/?([A-Za-z_][\w:.-]*)\b[^>]*>/g;
    let depth = 0;
    let versionStart = -1;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(inner)) !== null) {
      if (match[0].startsWith('<!--')) continue;

      const tagName = match[1].split(':').pop()?.toLowerCase();
      const isClosingTag = match[0].startsWith('</');
      if (isClosingTag) {
        if (depth === 1 && tagName === 'version' && versionStart >= 0) {
          const value = inner.slice(versionStart, match.index).trim();
          const start = innerStart + versionStart;
          return value ? { start, end: innerStart + match.index, value } : null;
        }
        depth = Math.max(0, depth - 1);
        continue;
      }

      if (depth === 0 && tagName === 'version') {
        versionStart = tagRegex.lastIndex;
      }
      if (!/\/\s*>$/.test(match[0])) depth++;
    }

    return null;
  }
}
