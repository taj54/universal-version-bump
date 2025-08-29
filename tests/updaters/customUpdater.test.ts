import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomUpdater } from '../../src/updaters/customUpdater';
import { FileHandler, ManifestParser } from '../../src/utils';
import * as core from '@actions/core';

vi.mock('../../src/utils/fileHandler');
vi.mock('../../src/utils/manifestParser');
vi.mock('@actions/core');

describe('CustomUpdater', () => {
  let customUpdater: CustomUpdater;
  let mockFileHandler: vi.Mocked<FileHandler>;
  let mockManifestParser: vi.Mocked<ManifestParser>;

  const filePath = 'test.txt';
  const variableName = 'APP_VERSION';

  beforeEach(() => {
    mockFileHandler = new FileHandler() as vi.Mocked<FileHandler>;
    mockManifestParser = new ManifestParser(mockFileHandler) as vi.Mocked<ManifestParser>;
    customUpdater = new CustomUpdater(filePath, variableName);

    // Mock the constructor's internal assignments
    (customUpdater as any).fileHandler = mockFileHandler;
    (customUpdater as any).manifestParser = mockManifestParser;
  });

  it('should always return true for canHandle', () => {
    expect(customUpdater.canHandle()).toBe(true);
  });

  describe('getCurrentVersion', () => {
    it('should return the current version if found', () => {
      mockManifestParser.getVersion.mockReturnValue('1.0.0');
      expect(customUpdater.getCurrentVersion()).toBe('1.0.0');
      expect(mockManifestParser.getVersion).toHaveBeenCalledWith(
        filePath,
        'regex',
        expect.objectContaining({ regex: expect.any(RegExp) }),
      );
    });

    it('should return null if version is not found', () => {
      mockManifestParser.getVersion.mockReturnValue(null);
      expect(customUpdater.getCurrentVersion()).toBeNull();
    });

    it('should return null and log debug message if manifestParser.getVersion throws an error', () => {
      const error = new Error('Parse error');
      mockManifestParser.getVersion.mockImplementation(() => {
        throw error;
      });
      const coreDebugSpy = vi.spyOn(core, 'debug').mockImplementation(() => {});

      expect(customUpdater.getCurrentVersion()).toBeNull();
      expect(coreDebugSpy).toHaveBeenCalledWith(
        `Could not read or parse version from ${filePath}: ${error}`,
      );
    });
  });

  describe('bumpVersion', () => {
    it('should successfully bump the version', () => {
      vi.spyOn(customUpdater, 'getCurrentVersion').mockReturnValue('1.0.0');
      mockManifestParser.updateVersion.mockReturnValue(undefined);
      const coreInfoSpy = vi.spyOn(core, 'info').mockImplementation(() => {});

      const newVersion = customUpdater.bumpVersion('patch');

      expect(newVersion).toBe('1.0.1');
      expect(mockManifestParser.updateVersion).toHaveBeenCalledWith(
        filePath,
        '1.0.1',
        'regex',
        expect.objectContaining({ regexReplace: expect.any(RegExp) }),
      );
      expect(coreInfoSpy).toHaveBeenCalledWith(
        `Bumped ${variableName} in ${filePath} from 1.0.0 to 1.0.1`,
      );
    });

    it('should throw an error if current version is not found', () => {
      vi.spyOn(customUpdater, 'getCurrentVersion').mockReturnValue(null);

      expect(() => customUpdater.bumpVersion('patch')).toThrow(
        `Could not find current version for variable '${variableName}' in file '${filePath}'`,
      );
    });
  });
});
