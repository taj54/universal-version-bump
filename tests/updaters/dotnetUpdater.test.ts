import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { DotNetUpdater } from '../../src/updaters/dotnetUpdater';

vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return { __esModule: true, default: mockFs, ...mockFs };
});

describe('DotNetUpdater', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bumps VersionPrefix in a project file', () => {
    (existsSync as vi.Mock).mockImplementation((path) => path === '.' || path === 'App.csproj');
    (readdirSync as vi.Mock).mockReturnValue(['App.csproj']);
    (readFileSync as vi.Mock).mockReturnValue(
      '<Project><PropertyGroup><VersionPrefix>1.2.3</VersionPrefix></PropertyGroup></Project>',
    );
    const updater = new DotNetUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.getCurrentVersion()).toBe('1.2.3');
    expect(updater.bumpVersion('patch')).toBe('1.2.4');
    expect(writeFileSync).toHaveBeenCalledWith(
      'App.csproj',
      '<Project><PropertyGroup><VersionPrefix>1.2.4</VersionPrefix></PropertyGroup></Project>',
    );
  });

  it('prefers shared Directory.Build.props over project files', () => {
    (existsSync as vi.Mock).mockImplementation(
      (path) => path === '.' || path === 'Directory.Build.props',
    );
    (readFileSync as vi.Mock).mockReturnValue(
      '<Project><PropertyGroup><Version>4.5.6</Version></PropertyGroup></Project>',
    );
    const updater = new DotNetUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.bumpVersion('minor')).toBe('4.6.0');
    expect(writeFileSync).toHaveBeenCalledWith(
      'Directory.Build.props',
      '<Project><PropertyGroup><Version>4.6.0</Version></PropertyGroup></Project>',
    );
  });
});
