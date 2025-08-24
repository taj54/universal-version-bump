import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdaterService } from '../../src/services';
import { Updater } from '../../src/interface';
import { PlatformDetectionError, VersionBumpError } from '../../src/errors';

const mockNodeUpdater: Updater = {
  platform: 'node',
  canHandle: vi.fn(),
  getCurrentVersion: vi.fn(),
  bumpVersion: vi.fn(),
};

const mockPythonUpdater: Updater = {
  platform: 'python',
  canHandle: vi.fn(),
  getCurrentVersion: vi.fn(),
  bumpVersion: vi.fn(),
};

const mockUpdaters: Updater[] = [mockNodeUpdater, mockPythonUpdater];

describe('UpdaterService', () => {
  let updaterService: UpdaterService;

  beforeEach(() => {
    updaterService = new UpdaterService(mockUpdaters);
    vi.clearAllMocks();
    mockNodeUpdater.canHandle.mockReset();
    mockNodeUpdater.bumpVersion.mockReset();
    mockPythonUpdater.canHandle.mockReset();
    mockPythonUpdater.bumpVersion.mockReset();
  });

  describe('detectPlatform', () => {
    it('should return the platform of the first updater that can handle', () => {
      mockNodeUpdater.canHandle.mockReturnValue(false);
      mockPythonUpdater.canHandle.mockReturnValue(true);

      expect(updaterService.getPlatform()).toBe('python');
      expect(mockNodeUpdater.canHandle).toHaveBeenCalled();
      expect(mockPythonUpdater.canHandle).toHaveBeenCalled();
    });

    it('should throw PlatformDetectionError if no updater can handle', () => {
      mockNodeUpdater.canHandle.mockReturnValue(false);
      mockPythonUpdater.canHandle.mockReturnValue(false);

      expect(() => updaterService.getPlatform()).toThrow(PlatformDetectionError);
      expect(() => updaterService.getPlatform()).toThrow('Could not detect platform.');
    });
  });

  describe('updateVersion', () => {
    it('should call bumpVersion on the correct updater and return the new version', () => {
      const newVersion = '1.2.4';
      mockNodeUpdater.bumpVersion.mockReturnValue(newVersion);

      const result = updaterService.updateVersion('node', 'patch');

      expect(result).toBe(newVersion);
      expect(mockNodeUpdater.bumpVersion).toHaveBeenCalledWith('patch');
      expect(mockPythonUpdater.bumpVersion).not.toHaveBeenCalled();
    });

    it('should throw VersionBumpError if no updater is found for the platform', () => {
      expect(() => updaterService.updateVersion('nonexistent', 'patch')).toThrow(VersionBumpError);
      expect(() => updaterService.updateVersion('nonexistent', 'patch')).toThrow(
        'No updater found for platform: nonexistent',
      );
    });
  });
});
