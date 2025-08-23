import fs from 'fs';
import semver, { ReleaseType } from 'semver';
import { Updater } from '../interface';

export class PHPUpdater implements Updater {
  platform = 'php';

  canHandle(): boolean {
    return (
      fs.existsSync('composer.json') ||
      fs.existsSync('VERSION') ||
      fs.existsSync('version.php') ||
      fs.existsSync('config.php')
    );
  }

  getCurrentVersion(): string | null {
    // composer.json
    if (fs.existsSync('composer.json')) {
      const composer = JSON.parse(fs.readFileSync('composer.json', 'utf8'));
      return composer.version || null;
    }

    // VERSION file
    if (fs.existsSync('VERSION')) {
      return fs.readFileSync('VERSION', 'utf8').trim();
    }

    // version.php
    if (fs.existsSync('version.php')) {
      const content = fs.readFileSync('version.php', 'utf8');
      const match = content.match(/['"]([\d.]+)['"]/);
      return match ? match[1] : null;
    }

    // config.php
    if (fs.existsSync('config.php')) {
      const content = fs.readFileSync('config.php', 'utf8');
      const match = content.match(/'version'\s*=>\s*'([\d.]+)'/);
      return match ? match[1] : null;
    }

    return null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const version = this.getCurrentVersion() || '0.1.0';
    const newVersion = semver.inc(version, releaseType) || version;

    // composer.json
    if (fs.existsSync('composer.json')) {
      const composer = JSON.parse(fs.readFileSync('composer.json', 'utf8'));
      composer.version = newVersion;
      fs.writeFileSync('composer.json', JSON.stringify(composer, null, 2));
      return newVersion;
    }

    // VERSION file
    if (fs.existsSync('VERSION')) {
      fs.writeFileSync('VERSION', newVersion);
      return newVersion;
    }

    // version.php
    if (fs.existsSync('version.php')) {
      const content = fs.readFileSync('version.php', 'utf8');
      const updated = content.replace(/(['"])[\d.]+(['"])/, `'${newVersion}'`);
      fs.writeFileSync('version.php', updated);
      return newVersion;
    }

    // config.php
    if (fs.existsSync('config.php')) {
      const content = fs.readFileSync('config.php', 'utf8');
      const updated = content.replace(/'version'\s*=>\s*'[\d.]+'/, `'version' => '${newVersion}'`);
      fs.writeFileSync('config.php', updated);
      return newVersion;
    }

    return newVersion;
  }
}
