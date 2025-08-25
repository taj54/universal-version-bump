
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { PHPUpdater } from '../../src/updaters/phpUpdater';
import { ReleaseType } from 'semver';

vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    __esModule: true,
    default: mockFs,
    ...mockFs,
  };
});

describe('PHPUpdater', () => {
  let phpUpdater: PHPUpdater;

  beforeEach(() => {
    vi.clearAllMocks();
    phpUpdater = new PHPUpdater();
  });

  describe('canHandle', () => {
    it.each(['composer.json', 'VERSION', 'version.php', 'config.php'])(
      'should return true if %s exists',
      (file) => {
        (existsSync as vi.Mock).mockImplementation((path) => path === file);
        expect(phpUpdater.canHandle()).toBe(true);
      },
    );

    it('should return false if no manifest file exists', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(phpUpdater.canHandle()).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('should get version from composer.json', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({ version: '1.0.0' }));
      phpUpdater.canHandle();
      expect(phpUpdater.getCurrentVersion()).toBe('1.0.0');
    });

    it('should get version from VERSION file', () => {
        (existsSync as vi.Mock).mockImplementation((path) => path === 'VERSION');
        (readFileSync as vi.Mock).mockReturnValue('1.2.3');
        phpUpdater.canHandle();
        expect(phpUpdater.getCurrentVersion()).toBe('1.2.3');
      });
  });

  describe('bumpVersion', () => {
    it.each(['major', 'minor', 'patch'])(
      'should bump composer.json version for %s release',
      (releaseType) => {
        (existsSync as vi.Mock).mockReturnValue(true);
        (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({ version: '1.0.0' }));
        phpUpdater.canHandle();
        const newVersion = phpUpdater.bumpVersion(releaseType as ReleaseType);
        expect(newVersion).not.toBe('1.0.0');
        expect(writeFileSync).toHaveBeenCalledWith(
          'composer.json',
          JSON.stringify({ version: newVersion }, null, 2),
        );
      },
    );

    it('should throw an error if manifest not found', () => {
        const updater = new PHPUpdater();
        expect(() => updater.bumpVersion('patch')).toThrow('PHP manifest file not found');
      });
  });
});
