import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { DartUpdater } from '../../src/updaters/dartUpdater';

vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return { __esModule: true, default: mockFs, ...mockFs };
});

describe('DartUpdater', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bumps the top-level pubspec version and keeps its inline comment', () => {
    (existsSync as vi.Mock).mockImplementation((path) => path === 'pubspec.yaml');
    (readFileSync as vi.Mock).mockReturnValue(
      'name: sample_app\nversion: 1.2.3+4 # release version\n',
    );
    const updater = new DartUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.getCurrentVersion()).toBe('1.2.3+4');
    expect(updater.bumpVersion('patch')).toBe('1.2.4');
    expect(writeFileSync).toHaveBeenCalledWith(
      'pubspec.yaml',
      'name: sample_app\nversion: 1.2.4 # release version\n',
    );
  });
});
