import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

export class PythonUpdater implements Updater {
  platform = 'python';

  canHandle(): boolean {
    return FileHandler.fileExists('pyproject.toml') || FileHandler.fileExists('setup.py');
  }

  getCurrentVersion(): string | null {
    if (FileHandler.fileExists('pyproject.toml')) {
      const content = FileHandler.readFile('pyproject.toml');
      const match = content.match(/version\s*=\s*"([^"]+)"/);
      return match ? match[1] : null;
    }
    if (FileHandler.fileExists('setup.py')) {
      const content = FileHandler.readFile('setup.py');
      const match = content.match(/version\s*=\s*["']([^"']+)["']/);
      return match ? match[1] : null;
    }
    return null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error('Python version not found');

    const newVersion = calculateNextVersion(current, releaseType);

    if (FileHandler.fileExists('pyproject.toml')) {
      let content = FileHandler.readFile('pyproject.toml');
      content = content.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
      FileHandler.writeFile('pyproject.toml', content);
    } else if (FileHandler.fileExists('setup.py')) {
      let content = FileHandler.readFile('setup.py');
      content = content.replace(/version\s*=\s*["'][^"']+["']/, `version="${newVersion}"`);
      FileHandler.writeFile('setup.py', content);
    }

    return newVersion;
  }
}
