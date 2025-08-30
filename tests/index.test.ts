import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';
import { UpdaterService, GitService, ChangelogService } from '../src/services';
import { UpdaterRegistry } from '../src/registry';
import { FileHandler, safeParseJSON } from '../src/utils';
import {
  PlatformDetectionError,
  VersionBumpError,
  FileNotFoundError,
  InvalidManifestError,
} from '../src/errors';

// Mock all external dependencies
vi.mock('@actions/core');
vi.mock('../src/services');
vi.mock('../src/registry');
vi.mock('../src/utils');
vi.mock('../src/config', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    RELEASE_TYPE: 'patch',
    TARGET_PLATFORM: 'node',
    GIT_TAG: true,
    TARGET_PATH: './',
    BUMP_TARGETS: '[]',
  };
});

// Mock process.chdir
const chdirSpy = vi.spyOn(process, 'chdir').mockImplementation(() => {});

describe('Main Action Logic', () => {
  let mockUpdaterService: vi.Mocked<UpdaterService>;
  let mockGitService: vi.Mocked<GitService>;
  let mockChangelogService: vi.Mocked<ChangelogService>;
  let mockUpdaterRegistry: vi.Mocked<UpdaterRegistry>;
  let mockFileHandler: vi.Mocked<FileHandler>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockUpdaterService = new UpdaterService(new UpdaterRegistry()) as vi.Mocked<UpdaterService>;
    mockGitService = new GitService('main') as vi.Mocked<GitService>;
    mockChangelogService = new ChangelogService(
      new FileHandler(),
      new GitService('main'),
      'CHANGELOG.md',
    ) as vi.Mocked<ChangelogService>;
    mockUpdaterRegistry = new UpdaterRegistry() as vi.Mocked<UpdaterRegistry>;
    mockFileHandler = new FileHandler() as vi.Mocked<FileHandler>;

    // Mock implementations for services
    (UpdaterService as unknown as vi.Mock).mockImplementation(() => mockUpdaterService);
    (GitService as unknown as vi.Mock).mockImplementation(() => mockGitService);
    (ChangelogService as unknown as vi.Mock).mockImplementation(() => mockChangelogService);
    (UpdaterRegistry as unknown as vi.Mock).mockImplementation(() => mockUpdaterRegistry);
    (FileHandler as unknown as vi.Mock).mockImplementation(() => mockFileHandler);

    // Default mock return values
    mockUpdaterRegistry.loadUpdaters.mockResolvedValue(undefined);
    mockUpdaterService.getPlatform.mockReturnValue('node');
    mockUpdaterService.updateVersion.mockReturnValue('1.0.1');
    mockGitService.getLatestTag.mockResolvedValue('v1.0.0');
    mockGitService.getCommitsSinceTag.mockResolvedValue(['feat: initial commit']);
    mockChangelogService.generateChangelog.mockReturnValue('Changelog content');
    mockChangelogService.updateChangelog.mockResolvedValue(undefined);
    mockGitService.configureGitUser.mockResolvedValue(undefined);
    mockGitService.createReleaseBranch.mockResolvedValue(null); // No branch by default
    mockGitService.createPullRequest.mockResolvedValue('pr_url');
    mockGitService.createAndPushTag.mockResolvedValue(undefined);
    (safeParseJSON as vi.Mock).mockReturnValue([]); // Default empty bump targets
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should run successfully and perform all steps', async () => {
    // Import the module to run the `run()` function
    const { run } = await import('../src/index');
    await run();

    expect(chdirSpy).toHaveBeenCalledWith('./');
    expect(mockUpdaterRegistry.loadUpdaters).toHaveBeenCalled();
    expect(mockUpdaterService.getPlatform).toHaveBeenCalledWith('node');
    expect(core.info).toHaveBeenCalledWith('Detected platform: node');
    expect(safeParseJSON).toHaveBeenCalledWith('[]');
    expect(mockUpdaterService.updateVersion).toHaveBeenCalledWith('node', 'patch', []);
    expect(core.setOutput).toHaveBeenCalledWith('new_version', '1.0.1');
    expect(mockGitService.getLatestTag).toHaveBeenCalled();
    expect(mockGitService.getCommitsSinceTag).toHaveBeenCalledWith('v1.0.0');
    expect(mockChangelogService.generateChangelog).toHaveBeenCalledWith(
      ['feat: initial commit'],
      '1.0.1',
    );
    expect(mockChangelogService.updateChangelog).toHaveBeenCalledWith('Changelog content');
    expect(mockGitService.configureGitUser).toHaveBeenCalled();
    expect(mockGitService.createReleaseBranch).toHaveBeenCalledWith('1.0.1');
    expect(mockGitService.createAndPushTag).toHaveBeenCalledWith('1.0.1');
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('should create a release branch and PR if createReleaseBranch returns a branch name', async () => {
    mockGitService.createReleaseBranch.mockResolvedValue('release/1.0.1');

    const { run } = await import('../src/index');
    await run();

    expect(mockGitService.createReleaseBranch).toHaveBeenCalledWith('1.0.1');
    expect(core.info).toHaveBeenCalledWith('✅ Created branch: release/1.0.1');
    expect(mockGitService.createPullRequest).toHaveBeenCalledWith('release/1.0.1', '1.0.1');
    expect(core.info).toHaveBeenCalledWith('✅ PR created: pr_url');
  });

  it('should not create a tag if GIT_TAG is false', async () => {
    vi.doMock('../src/config', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        GIT_TAG: false,
      };
    });

    // Re-import to apply the new mock for GIT_TAG
    vi.resetModules();
    const { run } = await import('../src/index');
    await run();

    expect(mockGitService.createAndPushTag).not.toHaveBeenCalled();
  });

  it('should handle PlatformDetectionError', async () => {
    mockUpdaterService.getPlatform.mockImplementation(() => {
      throw new PlatformDetectionError('No platform detected');
    });

    const { run } = await import('../src/index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('No platform detected');
  });

  it('should handle VersionBumpError', async () => {
    mockUpdaterService.updateVersion.mockImplementation(() => {
      throw new VersionBumpError('Failed to bump version');
    });

    const { run } = await import('../src/index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Failed to bump version');
  });

  it('should handle FileNotFoundError', async () => {
    mockGitService.getLatestTag.mockImplementation(() => {
      throw new FileNotFoundError('File not found');
    });

    const { run } = await import('../src/index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('File not found');
  });

  it('should handle InvalidManifestError', async () => {
    (safeParseJSON as vi.Mock).mockImplementation(() => {
      throw new InvalidManifestError('Invalid JSON');
    });

    const { run } = await import('../src/index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Invalid JSON');
  });

  it('should handle generic Error', async () => {
    mockGitService.configureGitUser.mockImplementation(() => {
      throw new Error('Generic error occurred');
    });

    const { run } = await import('../src/index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('Generic error occurred');
  });

  it('should handle unknown errors', async () => {
    mockGitService.configureGitUser.mockImplementation(() => {
      throw 'unknown error type';
    });

    const { run } = await import('../src/index');
    await run();

    expect(core.setFailed).toHaveBeenCalledWith('unknown error type');
  });
});
