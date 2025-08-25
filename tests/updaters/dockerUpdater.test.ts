
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { DockerUpdater } from '../../src/updaters/dockerUpdater';
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

describe('DockerUpdater', () => {
  let dockerUpdater: DockerUpdater;

  beforeEach(() => {
    vi.clearAllMocks();
    dockerUpdater = new DockerUpdater();
  });

  describe('canHandle', () => {
    it('should return true if Dockerfile exists', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      expect(dockerUpdater.canHandle()).toBe(true);
    });

    it('should return false if Dockerfile does not exist', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(dockerUpdater.canHandle()).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return the version from Dockerfile', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('LABEL version="1.0.0"');
      dockerUpdater.canHandle();
      expect(dockerUpdater.getCurrentVersion()).toBe('1.0.0');
    });

    it('should throw InvalidManifestError if version label is not found', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('LABEL other="value"');
      dockerUpdater.canHandle();
      expect(() => dockerUpdater.getCurrentVersion()).toThrow('Regex \'LABEL version="([^\"]+)\"\' did not find a match in Dockerfile');
    });
  });

  describe('bumpVersion', () => {
    beforeEach(() => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('LABEL version="1.0.0"');
      dockerUpdater.canHandle();
    });

    it.each(['major', 'minor', 'patch'])(
      'should bump the version for %s release',
      (releaseType) => {
        const newVersion = dockerUpdater.bumpVersion(releaseType as ReleaseType);
        expect(newVersion).not.toBe('1.0.0');
        expect(writeFileSync).toHaveBeenCalledWith(
          'Dockerfile',
          `LABEL version="${newVersion}"`,
        );
      },
    );

    it('should throw an error if Dockerfile not found', () => {
        const updater = new DockerUpdater();
        expect(() => updater.bumpVersion('patch')).toThrow('Dockerfile not found');
      });
  });
});
