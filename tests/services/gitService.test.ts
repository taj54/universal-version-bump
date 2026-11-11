import { GitService } from '../../src/services/gitService';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execMock } = vi.hoisted(() => ({ execMock: vi.fn() }));

vi.mock('@actions/exec', () => ({ exec: execMock }));

describe('GitService', () => {
  let gitService: GitService;

  beforeEach(() => {
    execMock.mockReset();
    gitService = new GitService();
  });

  describe('getLatestTag', () => {
    it('should throw an error if no tags are found', async () => {
      execMock.mockResolvedValue(1);
      await expect(gitService.getLatestTag()).rejects.toThrow(
        'No tags found in the repository. Please create a tag first.',
      );
    });

    it('should return the latest tag if tags are found', async () => {
      execMock.mockImplementation(async (_command, _args, options) => {
        if (options && options.listeners && options.listeners.stdout) {
          options.listeners.stdout(Buffer.from('v1.0.0'));
        }
        return 0;
      });
      const latestTag = await gitService.getLatestTag();
      expect(latestTag).toBe('v1.0.0');
    });
  });
});
