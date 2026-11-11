import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { JavaUpdater } from '../../src/updaters/javaUpdater';

vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return { __esModule: true, default: mockFs, ...mockFs };
});

describe('JavaUpdater', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates the Maven project version without changing parent or dependency versions', () => {
    const pom = `<project>
  <parent><groupId>example</groupId><artifactId>parent</artifactId><version>9.0.0</version></parent>
  <modelVersion>4.0.0</modelVersion>
  <groupId>example</groupId>
  <artifactId>app</artifactId>
  <version>1.2.3</version>
  <dependencies><dependency><version>3.4.5</version></dependency></dependencies>
</project>`;
    (existsSync as vi.Mock).mockImplementation((path) => path === 'pom.xml');
    (readFileSync as vi.Mock).mockReturnValue(pom);
    const updater = new JavaUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.getCurrentVersion()).toBe('1.2.3');
    expect(updater.bumpVersion('patch')).toBe('1.2.4');
    expect(writeFileSync).toHaveBeenCalledWith(
      'pom.xml',
      expect.stringContaining('<version>1.2.4</version>'),
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      'pom.xml',
      expect.stringContaining('<version>9.0.0</version>'),
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      'pom.xml',
      expect.stringContaining('<version>3.4.5</version>'),
    );
  });

  it('reads and bumps Gradle version assignments', () => {
    (existsSync as vi.Mock).mockImplementation((path) => path === 'build.gradle.kts');
    (readFileSync as vi.Mock).mockReturnValue('version = "2.0.0"\n');
    const updater = new JavaUpdater();

    expect(updater.canHandle()).toBe(true);
    expect(updater.bumpVersion('minor')).toBe('2.1.0');
    expect(writeFileSync).toHaveBeenCalledWith('build.gradle.kts', 'version = "2.1.0"\n');
  });
});
