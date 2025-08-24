import { ReleaseType } from 'semver';
import { Updater } from '../interface';
import { calculateNextVersion, FileHandler } from '../utils';

export class PHPUpdater implements Updater {
  platform = 'php';

  canHandle(): boolean {
    return (
      FileHandler.fileExists('composer.json') ||
      FileHandler.fileExists('VERSION') ||
      FileHandler.fileExists('version.php') ||
      FileHandler.fileExists('config.php')
    );
  }

  getCurrentVersion(): string | null {
    // composer.json
    if (FileHandler.fileExists('composer.json')) {
      const composer = JSON.parse(FileHandler.readFile('composer.json'));
      return composer.version || null;
    }

    // VERSION file
    if (FileHandler.fileExists('VERSION')) {
      return FileHandler.readFile('VERSION').trim();
    }

    // version.php
    if (FileHandler.fileExists('version.php')) {
      const content = FileHandler.readFile('version.php');
      const match = content.match(/['"]([\d.]+)['"]/);
      return match ? match[1] : null;
    }

    // config.php
    if (FileHandler.fileExists('config.php')) {
      const content = FileHandler.readFile('config.php');
      const match = content.match(/'version'\s*=>\s*'([\d.]+)'/);
      return match ? match[1] : null;
    }

    return null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const version = this.getCurrentVersion() || '0.1.0';
    const newVersion = calculateNextVersion(version, releaseType);

    // composer.json
    if (FileHandler.fileExists('composer.json')) {
      const composer = JSON.parse(FileHandler.readFile('composer.json'));
      composer.version = newVersion;
      FileHandler.writeFile('composer.json', JSON.stringify(composer, null, 2));
      return newVersion;
    }

    // VERSION file
    if (FileHandler.fileExists('VERSION')) {
      FileHandler.writeFile('VERSION', newVersion);
      return newVersion;
    }

    // version.php
    if (FileHandler.fileExists('version.php')) {
      const content = FileHandler.readFile('version.php');
      const updated = content.replace(/(['"])[\d.]+(['"])/, `$1${newVersion}$2`);
      FileHandler.writeFile('version.php', updated);
      return newVersion;
    }

    // config.php
    if (FileHandler.fileExists('config.php')) {
      const content = FileHandler.readFile('config.php');
      const updated = content.replace(/'version'\s*=>\s*'[\d.]+'/, `'version' => '${newVersion}'`);
      FileHandler.writeFile('config.php', updated);
      return newVersion;
    }

    return newVersion;
  }
}
