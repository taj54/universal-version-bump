import { describe, it, expect, vi, beforeEach } from 'vitest';

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { inc } from 'semver';

// Mock the fs module
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

// Mock the semver module
vi.mock('semver', () => {
  const mockInc = vi.fn();
  return {
    __esModule: true,
    default: {
      inc: mockInc,
    },
    inc: mockInc,
  };
});

import { NodeUpdater } from '../../src/updaters/nodeUpdater';

describe('NodeUpdater', () => {
  let nodeUpdater: NodeUpdater;

  beforeEach(() => {
    nodeUpdater = new NodeUpdater();
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('canHandle', () => {
    it('should return true if package.json exists', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      expect(nodeUpdater.canHandle()).toBe(true);
      expect(existsSync).toHaveBeenCalledWith('package.json');
    });

    it('should return false if package.json does not exist', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(nodeUpdater.canHandle()).toBe(false);
      expect(existsSync).toHaveBeenCalledWith('package.json');
    });
  });

  describe('getCurrentVersion', () => {
    it('should return the version from package.json if it exists', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      nodeUpdater.canHandle(); // Ensure manifestPath is set
      (readFileSync as vi.Mock).mockReturnValueOnce(JSON.stringify({ version: '1.0.0' }));
      expect(nodeUpdater.getCurrentVersion()).toBe('1.0.0');
      expect(readFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
    });

    it('should return null if package.json does not exist', () => {
      (existsSync as vi.Mock).mockReturnValue(false);
      expect(nodeUpdater.getCurrentVersion()).toBeNull();
      expect(readFileSync).not.toHaveBeenCalled();
    });
  });

  describe('bumpVersion', () => {
    const mockPackageJson = { name: 'test-pkg', version: '1.0.0' };
    const newVersion = '1.0.1';

    beforeEach(() => {
      (readFileSync as vi.Mock).mockReturnValue(JSON.stringify(mockPackageJson));
      (inc as vi.Mock).mockReturnValue(newVersion);
    });

    it('should increment the version and write to package.json', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      nodeUpdater.canHandle();
      const result = nodeUpdater.bumpVersion('patch');

      expect(inc).toHaveBeenCalledWith(mockPackageJson.version, 'patch');
      expect(writeFileSync).toHaveBeenCalledWith(
        'package.json',
        JSON.stringify({ ...mockPackageJson, version: newVersion }, null, 2),
      );
      expect(result).toBe(newVersion);
    });

    it('should handle major release type', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      nodeUpdater.canHandle();
      const majorVersion = '2.0.0';
      (inc as vi.Mock).mockReturnValue(majorVersion);
      const result = nodeUpdater.bumpVersion('major');
      expect(inc).toHaveBeenCalledWith(mockPackageJson.version, 'major');
      expect(result).toBe(majorVersion);
    });

    it('should handle minor release type', () => {
      (existsSync as vi.Mock).mockReturnValue(true);
      nodeUpdater.canHandle();
      const minorVersion = '1.1.0';
      (inc as vi.Mock).mockReturnValue(minorVersion);
      const result = nodeUpdater.bumpVersion('minor');
      expect(inc).toHaveBeenCalledWith(mockPackageJson.version, 'minor');
      expect(result).toBe(minorVersion);
    });
  });
});
