import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { GoUpdater } from '../../src/updaters/goUpdater';
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

describe('GoUpdater', () => {
  let goUpdater: GoUpdater;

  beforeEach(() => {
    vi.clearAllMocks();
    goUpdater = new GoUpdater();
  });

  describe('canHandle', () => {
    it('should return true if go.mod exists', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      expect(goUpdater.canHandle()).toBe(true);
    });

    it('should return false if go.mod does not exist', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(goUpdater.canHandle()).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return the version from go.mod', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('module github.com/user/repo\ngo 1.16\nmodule github.com/user/repo v1.2.3');
      goUpdater.canHandle();
      expect(goUpdater.getCurrentVersion()).toBe('1.2.3');
    });

    it('should throw InvalidManifestError if version is not found', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('module github.com/user/repo');
      goUpdater.canHandle();
      expect(() => goUpdater.getCurrentVersion()).toThrow("Regex '^module\\s+[^\\s]+\\s+v?(\\d+\\.\\d+\\.\\d+)' did not find a match in go.mod");
    });
  });

  describe('bumpVersion', () => {
    beforeEach(() => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue(`module github.com/user/repo
go 1.16

// This is a comment

require (
  github.com/some/dep v1.2.3
)

// version v1.0.0

module github.com/user/repo v1.0.0`);
      goUpdater.canHandle();
    });

    it.each(['major', 'minor', 'patch'])(
      'should bump the version for %s release',
      (releaseType) => {
        const newVersion = goUpdater.bumpVersion(releaseType as ReleaseType);
        expect(newVersion).not.toBe('1.0.0');
        expect(writeFileSync).toHaveBeenCalledWith(
          'go.mod',
          expect.stringContaining(`v${newVersion}`),
        );
      },
    );

    it('should throw an error if go.mod not found', () => {
        const updater = new GoUpdater();
        expect(() => updater.bumpVersion('patch')).toThrow('go.mod not found');
      });
  });
});
