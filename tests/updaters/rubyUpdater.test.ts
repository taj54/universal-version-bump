import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { RubyUpdater } from '../../src/updaters/rubyUpdater';

vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return { __esModule: true, default: mockFs, ...mockFs };
});

describe('RubyUpdater', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bumps a literal gemspec version', () => {
    (existsSync as vi.Mock).mockImplementation((path) => path === '.' || path === 'sample.gemspec');
    (readdirSync as vi.Mock).mockReturnValue(['sample.gemspec']);
    (readFileSync as vi.Mock).mockReturnValue(
      "Gem::Specification.new do |spec|\n  spec.version = '1.2.3'\nend\n",
    );
    const updater = new RubyUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.getCurrentVersion()).toBe('1.2.3');
    expect(updater.bumpVersion('minor')).toBe('1.3.0');
    expect(writeFileSync).toHaveBeenCalledWith(
      'sample.gemspec',
      "Gem::Specification.new do |spec|\n  spec.version = '1.3.0'\nend\n",
    );
  });

  it('supports a root version.rb when no gemspec exists', () => {
    (existsSync as vi.Mock).mockImplementation((path) => path === '.' || path === 'version.rb');
    (readdirSync as vi.Mock).mockReturnValue([]);
    (readFileSync as vi.Mock).mockReturnValue('VERSION = "0.9.9"\n');
    const updater = new RubyUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.bumpVersion('patch')).toBe('0.9.10');
    expect(writeFileSync).toHaveBeenCalledWith('version.rb', 'VERSION = "0.9.10"\n');
  });
});
