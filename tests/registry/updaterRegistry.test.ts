import { describe, it, expect } from 'vitest';
import { UpdaterRegistry } from '../../src/registry';

describe('UpdaterRegistry', () => {
  it('should load all updaters on instantiation', async () => {
    const registry = new UpdaterRegistry();
    await registry.ensureInitialized();
    const allUpdaters = registry.getAllUpdaters();

    // There are 6 updaters in the src/updaters directory
    expect(allUpdaters).toHaveLength(6);

    // Check if all platforms are loaded
    const platforms = allUpdaters.map((updater) => updater.platform);
    expect(platforms).toContain('node');
    expect(platforms).toContain('python');
    expect(platforms).toContain('rust');
    expect(platforms).toContain('go');
    expect(platforms).toContain('docker');
    expect(platforms).toContain('php');
  });
});
