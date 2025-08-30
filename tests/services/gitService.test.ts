import { GitService } from '../../src/services/gitService';
import * as exec from '@actions/exec';
import { vi } from 'vitest';

describe('GitService', () => {
  let gitService: GitService;

  beforeEach(() => {
    gitService = new GitService();
  });

  describe('getLatestTag', () => {
    it('should throw an error if no tags are found', async () => {
      vi.spyOn(exec, 'exec').mockResolvedValue(1); // Simulate git command failure
      await expect(gitService.getLatestTag()).rejects.toThrow(
        'No tags found in the repository. Please create a tag first.',
      );
    });

    it('should return the latest tag if tags are found', async () => {
      const execSpy = vi.spyOn(exec, 'exec').mockImplementation(async (command, args, options) => {
        if (options && options.listeners && options.listeners.stdout) {
          options.listeners.stdout(Buffer.from('v1.0.0'));
        }
        return 0;
      });
      const latestTag = await gitService.getLatestTag();
      expect(latestTag).toBe('v1.0.0');
      execSpy.mockRestore();
    });
  });
});
