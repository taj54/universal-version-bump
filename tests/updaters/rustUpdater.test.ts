import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { RustUpdater } from '../../src/updaters/rustUpdater';
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

describe('RustUpdater', () => {
  let rustUpdater: RustUpdater;

  beforeEach(() => {
    vi.clearAllMocks();
    rustUpdater = new RustUpdater();
  });

  describe('canHandle', () => {
    it('should return true if Cargo.toml exists', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      expect(rustUpdater.canHandle()).toBe(true);
    });

    it('should return false if Cargo.toml does not exist', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(rustUpdater.canHandle()).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return the version from Cargo.toml', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('version = "1.0.0"');
      rustUpdater.canHandle();
      expect(rustUpdater.getCurrentVersion()).toBe('1.0.0');
    });

    it('should throw InvalidManifestError if version is not found', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('name = "my-project"');
      rustUpdater.canHandle();
      expect(() => rustUpdater.getCurrentVersion()).toThrow(
        'Regex \'version\\s*=\\s*"([^"]+)"\' did not find a match in Cargo.toml',
      );
    });
  });

  describe('bumpVersion', () => {
    beforeEach(() => {
      (existsSync as vi.Mock).mockReturnValue(true);
      (readFileSync as vi.Mock).mockReturnValue('version = "1.0.0"');
      rustUpdater.canHandle();
    });

    it.each(['major', 'minor', 'patch'])(
      'should bump the version for %s release',
      (releaseType) => {
        const newVersion = rustUpdater.bumpVersion(releaseType as ReleaseType);
        expect(newVersion).not.toBe('1.0.0');
        expect(writeFileSync).toHaveBeenCalledWith(
          'Cargo.toml',
          expect.stringContaining(newVersion),
        );
      },
    );

    it('should throw an error if Cargo.toml not found', () => {
      const updater = new RustUpdater();
      expect(() => updater.bumpVersion('patch')).toThrow('Cargo.toml not found');
    });
  });
});
