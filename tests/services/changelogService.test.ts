import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangelogService } from '../../src/services/changelogService';
import { FileHandler } from '../../src/utils/fileHandler';
import * as exec from '@actions/exec';

vi.mock('@actions/exec');
vi.mock('../../src/utils/fileHandler');

describe('ChangelogService', () => {
  let changelogService: ChangelogService;
  let fileHandler: FileHandler;

  beforeEach(() => {
    fileHandler = new FileHandler();
    changelogService = new ChangelogService(fileHandler);
  });

  it('should get the latest tag', async () => {
    const execSpy = vi.spyOn(exec, 'exec').mockImplementation((command, args, options) => {
      options.listeners.stdout(Buffer.from('v1.0.0'));
      return Promise.resolve(0);
    });

    const latestTag = await changelogService.getLatestTag();

    expect(execSpy).toHaveBeenCalledWith(
      'git',
      ['describe', '--tags', '--abbrev=0'],
      expect.any(Object),
    );
    expect(latestTag).toBe('v1.0.0');
  });

  it('should get commits since a tag', async () => {
    const execSpy = vi.spyOn(exec, 'exec').mockImplementation((command, args, options) => {
      options.listeners.stdout(Buffer.from('commit1\ncommit2'));
      return Promise.resolve(0);
    });

    const commits = await changelogService.getCommitsSinceTag('v1.0.0');

    expect(execSpy).toHaveBeenCalledWith(
      'git',
      ['log', 'v1.0.0..HEAD', '--oneline'],
      expect.any(Object),
    );
    expect(commits).toEqual(['commit1', 'commit2']);
  });

  it('should generate a changelog', () => {
    const commits = ['hash1 feat: new feature', 'hash2 fix: a bug fix', 'hash3 chore: maintenance'];
    const newVersion = '1.1.0';

    const changelog = changelogService.generateChangelog(commits, newVersion);
    console.log(changelog);

    expect(changelog).toContain('## v1.1.0');
    expect(changelog).toContain('### Added');
    expect(changelog).toContain('- new feature');
    expect(changelog).toContain('### Fixed');
    expect(changelog).toContain('- a bug fix');
    expect(changelog).toContain('### Changed');
    expect(changelog).toContain('- maintenance');
  });

  it('should update the changelog file, skipping last change noted info', async () => {
    const existingChangelog =
      '# Changelog\n\n---\n\nThis is the last change noted info.\n\n## v1.0.0\n\n- Initial release';
    const newContent = '## v1.1.0\n\n- New feature';
    const expectedContent =
      '# Changelog\n\n---\n\n## v1.1.0\n\n- New feature## v1.0.0\n\n- Initial release';

    vi.spyOn(fileHandler, 'readFile').mockResolvedValue(existingChangelog);
    const writeFileSpy = vi.spyOn(fileHandler, 'writeFile').mockResolvedValue(undefined);

    await changelogService.updateChangelog(newContent);

    expect(writeFileSpy).toHaveBeenCalledWith('CHANGELOG.md', expectedContent);
  });

  it('should not update the changelog file if the version already exists', async () => {
    const existingChangelog = '## v1.1.0 2025-08-26\n\n### Added\n\n- existing feature\n\n';
    const readFileSpy = vi.spyOn(fileHandler, 'readFile').mockResolvedValue(existingChangelog);
    const writeFileSpy = vi.spyOn(fileHandler, 'writeFile').mockResolvedValue();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const newChangelog = '## v1.1.0 2025-08-26\n\n### Fixed\n\n- a bug fix\n\n';
    await changelogService.updateChangelog(newChangelog);

    expect(readFileSpy).toHaveBeenCalledWith('CHANGELOG.md');
    expect(writeFileSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Changelog for version ## v1.1.0 already exists. Skipping.',
    );
  });
});
