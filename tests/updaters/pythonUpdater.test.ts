import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { PythonUpdater } from '../../src/updaters/pythonUpdater';
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

describe('PythonUpdater', () => {
  let pythonUpdater: PythonUpdater;

  beforeEach(() => {
    vi.clearAllMocks();
    pythonUpdater = new PythonUpdater();
  });

  describe('canHandle', () => {
    it('should return true if pyproject.toml exists', () => {
      (existsSync as vi.Mock).mockImplementation((path) => path === 'pyproject.toml');
      expect(pythonUpdater.canHandle()).toBe(true);
    });

    it('should return true if setup.py exists', () => {
      (existsSync as vi.Mock).mockImplementation((path) => path === 'setup.py');
      expect(pythonUpdater.canHandle()).toBe(true);
    });

    it('should return false if no manifest file exists', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(pythonUpdater.canHandle()).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return the version from pyproject.toml', () => {
      (existsSync as vi.Mock).mockImplementation((path) => path === 'pyproject.toml');
      (readFileSync as vi.Mock).mockReturnValue('version = "1.2.3"');
      pythonUpdater.canHandle();
      expect(pythonUpdater.getCurrentVersion()).toBe('1.2.3');
    });

    it('should return the version from setup.py', () => {
      (existsSync as vi.Mock).mockImplementation((path) => path === 'setup.py');
      (readFileSync as vi.Mock).mockReturnValue("version='4.5.6'");
      pythonUpdater.canHandle();
      expect(pythonUpdater.getCurrentVersion()).toBe('4.5.6');
    });

    it('should return null if no manifest file is found', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      pythonUpdater.canHandle();
      expect(pythonUpdater.getCurrentVersion()).toBeNull();
    });

    it('should throw an error if pyproject.toml exists but version is not found', () => {
      (existsSync as vi.Mock).mockImplementation((path) => path === 'pyproject.toml');
      (readFileSync as vi.Mock).mockReturnValue('name = "my-package"'); // Missing version
      pythonUpdater.canHandle();
      expect(() => pythonUpdater.getCurrentVersion()).toThrow(
        'Regex \'version\\s*=\\s*"([^"]+)"\' did not find a match in pyproject.toml',
      );
    });

    it('should throw an error if setup.py exists but version is not found', () => {
      (existsSync as vi.Mock).mockImplementation((path) => path === 'setup.py');
      (readFileSync as vi.Mock).mockReturnValue('setup(name="my-package")'); // Missing version
      pythonUpdater.canHandle();
      expect(() => pythonUpdater.getCurrentVersion()).toThrow(
        "Regex 'version\\s*=\\s*[\"']([^\"']+)[\"']' did not find a match in setup.py",
      );
    });
  });

  describe('bumpVersion', () => {
    it.each(['major', 'minor', 'patch'])(
      'should bump the version for %s release in pyproject.toml',
      (releaseType) => {
        (existsSync as vi.Mock).mockImplementation((path) => path === 'pyproject.toml');
        (readFileSync as vi.Mock).mockReturnValue('version = "1.0.0"');
        pythonUpdater.canHandle();
        const newVersion = pythonUpdater.bumpVersion(releaseType as ReleaseType);
        expect(newVersion).not.toBe('1.0.0');
        expect(writeFileSync).toHaveBeenCalledWith(
          'pyproject.toml',
          expect.stringContaining(`version = "${newVersion}"`),
        );
      },
    );

    it.each(['major', 'minor', 'patch'])(
      'should bump the version for %s release in setup.py',
      (releaseType) => {
        (existsSync as vi.Mock).mockImplementation((path) => path === 'setup.py');
        (readFileSync as vi.Mock).mockReturnValue("version='1.0.0'");
        pythonUpdater.canHandle();
        const newVersion = pythonUpdater.bumpVersion(releaseType as ReleaseType);
        expect(newVersion).not.toBe('1.0.0');
        expect(writeFileSync).toHaveBeenCalledWith(
          'setup.py',
          expect.stringContaining(`version='${newVersion}'`),
        );
      },
    );

    it('should throw an error if manifest not found', () => {
      const updater = new PythonUpdater();
      expect(() => updater.bumpVersion('patch')).toThrow('Python manifest file not found');
    });
  });
});
