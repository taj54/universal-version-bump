import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomUpdater } from '../../src/updaters/customUpdater';
import { FileHandler, ManifestParser } from '../../src/utils';

vi.mock('../../src/utils/fileHandler');
vi.mock('../../src/utils/manifestParser');

describe('CustomUpdater', () => {
  let fileHandler: FileHandler;
  let manifestParser: ManifestParser;

  beforeEach(() => {
    fileHandler = new FileHandler();
    manifestParser = new ManifestParser(fileHandler);
  });

  it('should always be able to handle the request', () => {
    const updater = new CustomUpdater('dummy.txt', 'version');
    expect(updater.canHandle()).toBe(true);
  });

  it('should get the current version from a custom file', () => {
    const updater = new CustomUpdater('dummy.txt', 'version');
    updater['manifestParser'] = manifestParser;
    const getVersionSpy = vi.spyOn(manifestParser, 'getVersion').mockReturnValue('1.2.3');
    const version = updater.getCurrentVersion();
    expect(getVersionSpy).toHaveBeenCalled();
    expect(version).toBe('1.2.3');
  });

  it('should bump the version in a custom file', () => {
    const updater = new CustomUpdater('dummy.txt', 'version');
    updater['manifestParser'] = manifestParser;
    vi.spyOn(manifestParser, 'getVersion').mockReturnValue('1.2.3');
    const updateVersionSpy = vi.spyOn(manifestParser, 'updateVersion');
    const newVersion = updater.bumpVersion('patch');
    expect(newVersion).toBe('1.2.4');
    expect(updateVersionSpy).toHaveBeenCalled();
  });

  it('should return null if the version is not found', () => {
    const updater = new CustomUpdater('dummy.txt', 'version');
    updater['manifestParser'] = manifestParser;
    vi.spyOn(manifestParser, 'getVersion').mockReturnValue(null);
    expect(updater.getCurrentVersion()).toBeNull();
  });

  it('should throw an error when bumping if the version is not found', () => {
    const updater = new CustomUpdater('dummy.txt', 'version');
    updater['manifestParser'] = manifestParser;
    vi.spyOn(manifestParser, 'getVersion').mockReturnValue(null);
    expect(() => updater.bumpVersion('patch')).toThrow(
      "Could not find current version for variable 'version' in file 'dummy.txt'",
    );
  });
});
