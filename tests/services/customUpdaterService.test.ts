import { describe, it, expect, vi } from 'vitest';
import { CustomUpdaterService } from '../../src/services/customUpdaterService';
import { CustomUpdater } from '../../src/updaters';
import { VersionBumpError } from '../../src/errors';

vi.mock('../../src/updaters/customUpdater');

describe('CustomUpdaterService', () => {
  it('should throw an error if no bump targets are provided', () => {
    const service = new CustomUpdaterService();
    expect(() => service.updateCustomVersions('patch', [])).toThrow(
      new VersionBumpError('No bump_targets provided for custom platform.'),
    );
  });

  it('should throw an error for invalid bump targets', () => {
    const service = new CustomUpdaterService();
    const invalidTargets = [{ path: 'some/path', variable: '' }];
    expect(() => service.updateCustomVersions('patch', invalidTargets)).toThrow(
      new VersionBumpError('Invalid bump_target provided for custom platform.'),
    );
  });

  it('should call the custom updater for each bump target', () => {
    const service = new CustomUpdaterService();
    const bumpTargets = [
      { path: 'path/to/file1', variable: 'version1' },
      { path: 'path/to/file2', variable: 'version2' },
    ];

    service.updateCustomVersions('patch', bumpTargets);

    expect(CustomUpdater).toHaveBeenCalledTimes(2);
    expect(CustomUpdater).toHaveBeenCalledWith('path/to/file1', 'version1');
    expect(CustomUpdater).toHaveBeenCalledWith('path/to/file2', 'version2');
  });

  it('should return the last bumped version', () => {
    const service = new CustomUpdaterService();
    const bumpTargets = [
      { path: 'path/to/file1', variable: 'version1' },
      { path: 'path/to/file2', variable: 'version2' },
    ];

    const mockBumpVersion = vi.fn();
    mockBumpVersion.mockReturnValueOnce('1.0.1').mockReturnValueOnce('2.0.1');

    vi.mocked(CustomUpdater).mockImplementation(() => {
      return {
        bumpVersion: mockBumpVersion,
      } as unknown as CustomUpdater;
    });

    const lastVersion = service.updateCustomVersions('patch', bumpTargets);

    expect(lastVersion).toBe('2.0.1');
  });
});
