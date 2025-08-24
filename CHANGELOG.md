# 📦 Changelog for Universal Version Bump

All notable changes for each version of the Ambient Music extension.

---

## v0.7.2 2025 08 24

- refactor: Moved `UpdaterRegistry` to `src/registry` for better organization and updated all relevant imports.

## v0.7.1 2025 08 24

- refactor: Encapsulate Git operations in a GitService
- refactor: Extract version calculation to a separate utility
- refactor: Introduce UpdaterService for dependency injection
- feat: Introduce custom error types for granular error handling
- refactor: Extract Git operations into a separate utility
- Refactor: Centralized file handling operations by introducing a new FileHandler utility. This improves consistency and maintainability across different updaters.
- fix: Corrected NodeUpdater tests by ensuring manifestPath is set.
- refactor: Centralized manifest parsing and updating logic by introducing `ManifestParser` utility and updating all updaters to use it.
- feat: Enhance version bump action with explicit platform and git tag control
  - Add `target_platform` input to `action.yml` allowing users to explicitly specify the platform for version bumping, bypassing automatic detection.
  - Modify `UpdaterService` to use the `target_platform` if provided, otherwise fall back to existing detection logic.
  - Update `index.ts` to read and pass `target_platform` to `UpdaterService`.
  - Implement conditional Git tag creation based on the `git_tag` input from `action.yml`.
- build: Updated `dist/index.js` after centralizing action configuration.

## v0.7.0 2025 08 24

- fix: Update version badges in README for consistency.
- feat: Integrate Vitest for comprehensive unit testing.
- chore: Bump version to 0.7.0.

## v0.6.2 2025 08 24

- fix: Update version badges in README for consistency.
- feat: Integrate Vitest for comprehensive unit testing.
- chore: Bump version to 0.6.2.

## v0.6.0 2025 08 23

## v0.5.1 2025 08 23

- feat: Improve error handling in `src/index.ts` to gracefully manage unknown error types.
- chore: Update `package.json` to include linting and formatting in the `prepare` script, ensuring code quality before building.

## v0.5.0 2025 08 23

-minor release

## v0.4.0 2025 08 23

-minor release

## v0.3.1 2025 08 23

- refactor(release): move release creation to separate workflow

## v0.3.0 2025 08 23

- ci: version bump updated
- refactor: pnpm version updated
- ci: pipeline improvement
- fix: the version struct updated

## v0.2.1 2025 08 22

- ci: add tag and release workflow
- ci: automate release creation with release notes
- feat: add php support
- refactor: add multi-platform support

## v0.2.0 2025 08 22

- ci: add tag and release workflow
- ci: automate release creation with release notes
- feat: add php support
- refactor: add multi-platform support

## v0.1.8 2025 08 22

- chore: bump version to 0.1.8
- refactor: place changed

## v0.1.7 2025 08 22

- chore: bump version to 0.1.7
- security: security file added

## v0.1.6 2025 08 22

- docs: Update README
- chore: bump version to 0.1.6

## v0.1.5 2025 08 22

- Docs: README updated
- chore: bump version to 0.1.5

## v0.1.4 2025 08 22

- Fix: Update release workflow
- chore: bump version to 0.1.4

## v0.1.2 2025 08 22

- feat: version bumped 0.1.2
- chore: bump version to 0.1.2

## v0.1.1 2025 08 22

- ci: fallback added
- chore: bump version to 0.1.1
- feat: ci removed
- feat: pnpm setup in the release yml
- ci path updated
- feat: version bump minor release 0.1.0

## v0.1.0 2025 08 22

- ci: Keep the versions up-to-date
- feat:updated
- feat: write permission added in the release.yml
- ci: release added
- build: update build script
- docs: add contribution guidelines
- docs: add COC
- docs: add developer guide
- docs: update readme
- Initial action
