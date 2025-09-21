import { describe, it, expect, vi, type Mock } from 'vitest';

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { inc } from 'semver';

// Mock the fs module
vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
  return {
    __esModule: true,
    default: mockFs,
    ...mockFs,
  };
});

// Mock the semver module
vi.mock('semver', () => {
  const mockInc = vi.fn();
  return {
    __esModule: true,
    default: {
      inc: mockInc,
    },
    inc: mockInc,
  };
});

import { DenoUpdater } from '../../src/updaters/denoUpdater';

describe('DenoUpdater (AAA)', () => {
  describe('canHandle', () => {
    it('returns true if deno.json exists', () => {
      vi.clearAllMocks();
      (existsSync as unknown as Mock).mockImplementation((path: string) => path === 'deno.json');
      const updater = new DenoUpdater();

      const can = updater.canHandle();

      expect(can).toBe(true);
    });

    it('returns true if jsr.json exists', () => {
      vi.clearAllMocks();
      (existsSync as unknown as Mock).mockImplementation((path: string) => path === 'jsr.json');
      const updater = new DenoUpdater();

      const can = updater.canHandle();

      expect(can).toBe(true);
    });

    it('returns false if neither exists', () => {
      vi.clearAllMocks();
      (existsSync as unknown as Mock).mockReturnValue(false);
      const updater = new DenoUpdater();

      const can = updater.canHandle();

      expect(can).toBe(false);
    });
  });

  describe('getCurrentVersion', () => {
    it('reads version from deno.json', () => {
      vi.clearAllMocks();
      (existsSync as unknown as Mock).mockImplementation((path: string) => path === 'deno.json');
      const updater = new DenoUpdater();
      updater.canHandle();
      (readFileSync as unknown as Mock).mockReturnValue(JSON.stringify({ version: '0.1.0' }));

      const version = updater.getCurrentVersion();

      expect(version).toBe('0.1.0');
    });
  });

  describe('bumpVersion', () => {
    it('updates both deno.json and jsr.json if both exist', () => {
      vi.clearAllMocks();
      (existsSync as unknown as Mock).mockImplementation(
        (path: string) => path === 'deno.json' || path === 'jsr.json',
      );
      (readFileSync as unknown as Mock).mockReturnValueOnce(JSON.stringify({ version: '0.1.0' }));
      (inc as unknown as Mock).mockReturnValue('0.1.1');
      const updater = new DenoUpdater();
      updater.canHandle();

      const result = updater.bumpVersion('patch');

      expect(result).toBe('0.1.1');
      expect(writeFileSync).toHaveBeenCalledWith(
        'deno.json',
        JSON.stringify({ version: '0.1.1' }, null, 2),
      );
      expect(writeFileSync).toHaveBeenCalledWith(
        'jsr.json',
        JSON.stringify({ version: '0.1.1' }, null, 2),
      );
    });
  });
});
