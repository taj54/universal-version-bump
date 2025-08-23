import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Updater } from '../src/interface';

// Define the mock updater instances
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

const mockRustUpdater: Updater = {
  platform: 'rust',
  canHandle: vi.fn(),
  getCurrentVersion: vi.fn(),
  bumpVersion: vi.fn(),
};

const mockGoUpdater: Updater = {
  platform: 'go',
  canHandle: vi.fn(),
  getCurrentVersion: vi.fn(),
  bumpVersion: vi.fn(),
};

const mockDockerUpdater: Updater = {
  platform: 'docker',
  canHandle: vi.fn(),
  getCurrentVersion: vi.fn(),
  bumpVersion: vi.fn(),
};

const mockPHPUpdater: Updater = {
  platform: 'php',
  canHandle: vi.fn(),
  getCurrentVersion: vi.fn(),
  bumpVersion: vi.fn(),
};

// Mock the internal updaters array in updaterUtil.ts
vi.doMock('../src/updaters', () => ({
  NodeUpdater: vi.fn(() => mockNodeUpdater),
  PythonUpdater: vi.fn(() => mockPythonUpdater),
  RustUpdater: vi.fn(() => mockRustUpdater),
  GoUpdater: vi.fn(() => mockGoUpdater),
  DockerUpdater: vi.fn(() => mockDockerUpdater),
  PHPUpdater: vi.fn(() => mockPHPUpdater),
}));

// Import the module under test AFTER the mocks are defined
// This import needs to be dynamic to ensure it's loaded after mocks are applied
let detectPlatform: unknown;
let updateVersion: unknown;

describe('updaterUtil', () => {
  beforeEach(async () => {
    vi.resetModules(); // Reset modules to ensure fresh imports after mocks
    // Dynamically import the module under test after mocks are set up
    const module = await import('../src/utils/updaterUtil');
    detectPlatform = module.detectPlatform;
    updateVersion = module.updateVersion;

    vi.clearAllMocks();
    // Reset mock implementations for each test
    mockNodeUpdater.canHandle.mockReset();
    mockNodeUpdater.bumpVersion.mockReset();
    mockPythonUpdater.canHandle.mockReset();
    mockPythonUpdater.bumpVersion.mockReset();
    mockRustUpdater.canHandle.mockReset();
    mockRustUpdater.bumpVersion.mockReset();
    mockGoUpdater.canHandle.mockReset();
    mockGoUpdater.bumpVersion.mockReset();
    mockDockerUpdater.canHandle.mockReset();
    mockDockerUpdater.bumpVersion.mockReset();
    mockPHPUpdater.canHandle.mockReset();
    mockPHPUpdater.bumpVersion.mockReset();
  });

  describe('detectPlatform', () => {
    it('should return the platform of the first updater that can handle', () => {
      mockNodeUpdater.canHandle.mockReturnValue(false);
      mockPythonUpdater.canHandle.mockReturnValue(true);
      mockRustUpdater.canHandle.mockReturnValue(false);
      mockGoUpdater.canHandle.mockReturnValue(false);
      mockDockerUpdater.canHandle.mockReturnValue(false);
      mockPHPUpdater.canHandle.mockReturnValue(false);

      expect(detectPlatform()).toBe('python');
      expect(mockNodeUpdater.canHandle).toHaveBeenCalled();
      expect(mockPythonUpdater.canHandle).toHaveBeenCalled();
    });

    it('should return "unknown" if no updater can handle', () => {
      mockNodeUpdater.canHandle.mockReturnValue(false);
      mockPythonUpdater.canHandle.mockReturnValue(false);
      mockRustUpdater.canHandle.mockReturnValue(false);
      mockGoUpdater.canHandle.mockReturnValue(false);
      mockDockerUpdater.canHandle.mockReturnValue(false);
      mockPHPUpdater.canHandle.mockReturnValue(false);

      expect(detectPlatform()).toBe('unknown');
      expect(mockNodeUpdater.canHandle).toHaveBeenCalled();
      expect(mockPythonUpdater.canHandle).toHaveBeenCalled();
    });
  });

  describe('updateVersion', () => {
    it('should call bumpVersion on the correct updater and return the new version', () => {
      const newVersion = '1.2.4';
      mockNodeUpdater.bumpVersion.mockReturnValue(newVersion);

      const result = updateVersion('node', 'patch');

      expect(result).toBe(newVersion);
      expect(mockNodeUpdater.bumpVersion).toHaveBeenCalledWith('patch');
      expect(mockPythonUpdater.bumpVersion).not.toHaveBeenCalled();
    });

    it('should throw an error if no updater is found for the platform', () => {
      expect(() => updateVersion('nonexistent', 'patch')).toThrowError(
        'No updater found for platform: nonexistent',
      );
    });
  });
});
