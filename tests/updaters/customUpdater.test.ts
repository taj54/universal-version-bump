import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomUpdater } from '../../src/updaters/customUpdater';
import { FileHandler } from '../../src/utils/fileHandler';
import { ManifestParser } from '../../src/utils/manifestParser';
import * as versionUtil from '../../src/utils/versionUtil';

// Mock FileHandler
vi.mock('../../src/utils/fileHandler', () => {
  const mockFileHandler = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    fileExists: vi.fn(),
  };
  return { FileHandler: vi.fn(() => mockFileHandler) };
});

// Mock ManifestParser
vi.mock('../../src/utils/manifestParser', () => {
  const mockManifestParser = {
    getVersion: vi.fn(),
    updateVersion: vi.fn(),
  };
  return { ManifestParser: vi.fn(() => mockManifestParser) };
});

// Mock versionUtil
vi.mock('../../src/utils/versionUtil', () => ({
  calculateNextVersion: vi.fn(),
}));

describe('CustomUpdater', () => {
  let customUpdater: CustomUpdater;
  let mockFileHandler: FileHandler;
  let mockManifestParser: ManifestParser;

  const mockFilePath = 'test.txt';
  const mockVariableName = 'APP_VERSION';

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileHandler = new FileHandler();
    mockManifestParser = new ManifestParser(mockFileHandler);
    customUpdater = new CustomUpdater(mockFilePath, mockVariableName);
  });

  describe('canHandle', () => {
    it('should always return true', () => {
      expect(customUpdater.canHandle()).toBe(true);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return the version from ManifestParser', () => {
      (mockManifestParser.getVersion as vi.Mock).mockReturnValue('1.0.0');
      expect(customUpdater.getCurrentVersion()).toBe('1.0.0');
      expect(mockManifestParser.getVersion).toHaveBeenCalledWith(
        mockFilePath,
        'regex',
        expect.any(Object),
      );
    });

    it('should return null if ManifestParser returns null', () => {
      (mockManifestParser.getVersion as vi.Mock).mockReturnValue(null);
      expect(customUpdater.getCurrentVersion()).toBeNull();
    });

    it('should return null if ManifestParser throws an error', () => {
      (mockManifestParser.getVersion as vi.Mock).mockImplementation(() => {
        throw new Error('Parse error');
      });
      expect(customUpdater.getCurrentVersion()).toBeNull();
    });
  });

  describe('bumpVersion', () => {
    const oldVersion = '1.0.0';
    const newVersion = '1.0.1';

    beforeEach(() => {
      (mockManifestParser.getVersion as vi.Mock).mockReturnValue(oldVersion);
      (versionUtil.calculateNextVersion as vi.Mock).mockReturnValue(newVersion);
    });

    it('should bump the version and call ManifestParser.updateVersion', () => {
      const result = customUpdater.bumpVersion('patch');

      expect(versionUtil.calculateNextVersion).toHaveBeenCalledWith(oldVersion, 'patch');
      expect(mockManifestParser.updateVersion).toHaveBeenCalledWith(
        mockFilePath,
        newVersion,
        'regex',
        expect.any(Object),
      );
      expect(result).toBe(newVersion);
    });

    it('should throw an error if current version is not found', () => {
      (mockManifestParser.getVersion as vi.Mock).mockReturnValue(null);
      expect(() => customUpdater.bumpVersion('patch')).toThrow(
        `Could not find current version for variable '${mockVariableName}' in file '${mockFilePath}'`,
      );
    });
  });
});
