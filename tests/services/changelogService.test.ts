import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangelogService } from '../../src/services/changelogService';
import { FileHandler } from '../../src/utils/fileHandler';
import { GitService } from '../../src/services/gitService';
import * as core from '@actions/core';

vi.mock('@actions/exec');
vi.mock('../../src/utils/fileHandler');
vi.mock('../../src/services/gitService');
vi.mock('@actions/core');

describe('ChangelogService', () => {
  let changelogService: ChangelogService;
  let fileHandler: FileHandler;
  let gitService: GitService;

  beforeEach(() => {
    fileHandler = new FileHandler();
    gitService = new GitService();
    changelogService = new ChangelogService(fileHandler, gitService);
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

  it('should update the changelog file', async () => {
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
    vi.spyOn(fileHandler, 'readFile').mockResolvedValue(existingChangelog);
    const writeFileSpy = vi.spyOn(fileHandler, 'writeFile').mockResolvedValue();
    const coreInfoSpy = vi.spyOn(core, 'info').mockImplementation(() => {});

    const newChangelog = '## v1.1.0 2025-08-26\n\n### Fixed\n\n- a bug fix\n\n';
    await changelogService.updateChangelog(newChangelog);

    expect(writeFileSpy).not.toHaveBeenCalled();
    expect(coreInfoSpy).toHaveBeenCalledWith(
      'Changelog for version ## v1.1.0 already exists. Skipping.',
    );
  });
});
