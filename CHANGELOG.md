# 📦 Changelog for Universal Version Bump

All notable changes for each version of the Ambient Music extension.

---

## v0.10.0 2025-08-27

### Added

- add changelog generation
- version bumpupdated this  taj54/universal-version-bump@v0.9.0

### Changed

- improve error handling
- bump version to v0.9.4
- Merge pull request #21 from taj54/version/v0.9.4
- bump version to v0.9.4
- add changelog for version bumps
- Merge pull request #18 from taj54/version/v0.9.3
- bump version to v0.9.3
- fix path to reusable workflow
- bump version to v0.9.2
- Merge pull request #17 from taj54/version/v0.9.2
- bump version to v0.9.2
- Merge pull request #16 from taj54/develop-changelog-add-process
- update changelog and readme
- update CHANGELOG.md
- add unit tests for updaters
- update vitest and dependencies
- improve README with enhanced structure and details
- Merge pull request #15 from taj54/version/v0.9.1
- Update CHANGELOG.md for v0.9.1
- bump version to v0.9.1

### Fixed

- improve changelog update logic
- prevent duplicate changelog entries
- improve error handling in updater tests

## v0.9.4 2025-08-26

### Added

- add changelog generation
- version bumpupdated this taj54/universal-version-bump@v0.9.0

### Changed

- add changelog for version bumps
- Merge pull request #18 from taj54/version/v0.9.3
- bump version to v0.9.3
- fix path to reusable workflow
- bump version to v0.9.2
- Merge pull request #17 from taj54/version/v0.9.2
- bump version to v0.9.2
- Merge pull request #16 from taj54/develop-changelog-add-process
- update changelog and readme
- update CHANGELOG.md
- add unit tests for updaters
- update vitest and dependencies
- improve README with enhanced structure and details
- Merge pull request #15 from taj54/version/v0.9.1
- Update CHANGELOG.md for v0.9.1
- bump version to v0.9.1

### Fixed

- improve changelog update logic
- prevent duplicate changelog entries
- improve error handling in updater tests

## v0.9.3 2025-08-26

### Added

- add changelog generation
- version bumpupdated this taj54/universal-version-bump@v0.9.0

### Changed

- fix path to reusable workflow
- bump version to v0.9.2
- Merge pull request #17 from taj54/version/v0.9.2
- bump version to v0.9.2
- Merge pull request #16 from taj54/develop-changelog-add-process
- update changelog and readme
- update CHANGELOG.md
- add unit tests for updaters
- update vitest and dependencies
- improve README with enhanced structure and details
- Merge pull request #15 from taj54/version/v0.9.1
- Update CHANGELOG.md for v0.9.1
- bump version to v0.9.1

### Fixed

- improve error handling in updater tests

## v0.9.1 2025 08 25

### Changed

- Bumped version to v0.9.1.

### Fixed

- **changelog:** Strip prefixes like `feat:` and `fix:` from changelog entries.

### Added

- **changelog:** Prevent duplicate changelog entries for the same version.
- **changelog:** Place new changelog entries after the header in `CHANGELOG.md`.

## v0.9.0 2025 08 25

### Added

- Implemented automatic release branch and pull request generation for version bumps.
- Sourcemap and `index.js` are now included in the `dist` folder.

### Changed

- The `phpUpdater` regex has been updated to better handle version replacements.
- The regex for content replacement in the manifest update has been improved.
- The build process has been enhanced with source maps, license generation, and minor documentation formatting.
- `README.md`, `DEVELOPER.md`, and `CHANGELOG.md` have been updated with action inputs.

### Fixed

- Improved version handling and regex replacements in updaters.

## v0.8.10 2025 08 25

### Changed

- The `phpUpdater` regex has been updated to better handle version replacements.
- The regex for content replacement in the manifest update has been improved.
- The build process has been enhanced with source maps, license generation, and minor documentation formatting.
- `README.md`, `DEVELOPER.md`, and `CHANGELOG.md` have been updated with action inputs.

### Added

- Sourcemap and `index.js` are now included in the `dist` folder.

### Fixed

- Improved version handling and regex replacements in updaters.

## v0.8.2 2025 08 24

### Fixed

- Corrected version handling to preserve 'v' prefix in `versionUtil.ts`.
- Updated `regexReplace` patterns in `dockerUpdater.ts` to correctly replace only the version string.
- Updated `regexReplace` patterns in `pythonUpdater.ts` to correctly replace only the version string.

### Added

- Implemented automatic release branch creation and pull request generation for version bumps.

### Changed

- Updated `README.md` and `DEVELOPER.md` to include comprehensive details about GitHub Action inputs from `action.yml`.

## v0.8.1 2025 08 24

### Added

- Added `target_path` input to specify the working directory for version bumping.

## v0.8.0 2025 08 24

### Changed

- Moved `UpdaterRegistry` to `src/registry` for better organization and updated all relevant imports.
- Applied Dependency Inversion Principle (DIP) by passing `FileHandler` as a dependency to `ManifestParser`, and `ManifestParser` as a dependency to updaters. This improves testability and flexibility.
- Defined more granular error classes (`FileNotFoundError`, `InvalidManifestError`) within `errors.ts` to enable more precise error handling and user feedback.
- Updated `FileHandler` and `ManifestParser` to throw these specific errors, and `index.ts` to catch and handle them.

- Enhanced version bump action with explicit platform and git tag control:
  - Added `target_platform` input to `action.yml` allowing users to explicitly specify the platform for version bumping, bypassing automatic detection.
  - Modified `UpdaterService` to use the `target_platform` if provided, otherwise fall back to existing detection logic.
  - Updated `index.ts` to read and pass `target_platform` to `UpdaterService`.
  - Implemented conditional Git tag creation based on the `git_tag` input from `action.yml`.
- Introduced custom error types for granular error handling.

### Changed

- Encapsulated Git operations in a `GitService`.
- Extracted version calculation to a separate utility.
- Introduced `UpdaterService` for dependency injection.
- Extracted Git operations into a separate utility.
- Centralized file handling operations by introducing a new `FileHandler` utility. This improves consistency and maintainability across different updaters.
- Centralized manifest parsing and updating logic by introducing `ManifestParser` utility and updating all updaters to use it.
- Updated `dist/index.js` after centralizing action configuration.

### Fixed

- Corrected NodeUpdater tests by ensuring manifestPath is set.

## v0.7.3 2025 08 24

### Changed

- Bump version to 0.7.3.

## v0.7.2 2025 08 24

### Changed

- Moved `UpdaterRegistry` to `src/registry` for better organization and updated all relevant imports.
- Applied Dependency Inversion Principle (DIP) by passing `FileHandler` as a dependency to `ManifestParser`, and `ManifestParser` as a dependency to updaters. This improves testability and flexibility.
- Defined more granular error classes (`FileNotFoundError`, `InvalidManifestError`) within `errors.ts` to enable more precise error handling and user feedback.
- Updated `FileHandler` and `ManifestParser` to throw these specific errors, and `index.ts` to catch and handle them.

## v0.7.1 2025 08 24

### Added

- Enhanced version bump action with explicit platform and git tag control:
  - Added `target_platform` input to `action.yml` allowing users to explicitly specify the platform for version bumping, bypassing automatic detection.
  - Modified `UpdaterService` to use the `target_platform` if provided, otherwise fall back to existing detection logic.
  - Updated `index.ts` to read and pass `target_platform` to `UpdaterService`.
  - Implemented conditional Git tag creation based on the `git_tag` input from `action.yml`.
- Introduced custom error types for granular error handling.

### Changed

- Encapsulated Git operations in a `GitService`.
- Extracted version calculation to a separate utility.
- Introduced `UpdaterService` for dependency injection.
- Extracted Git operations into a separate utility.
- Centralized file handling operations by introducing a new `FileHandler` utility. This improves consistency and maintainability across different updaters.
- Centralized manifest parsing and updating logic by introducing `ManifestParser` utility and updating all updaters to use it.
- Updated `dist/index.js` after centralizing action configuration.

### Fixed

- Corrected NodeUpdater tests by ensuring manifestPath is set.

## v0.7.0 2025 08 24

### Added

- Integrated Vitest for comprehensive unit testing.

### Fixed

- Updated version badges in README for consistency.

### Changed

- Bumped version to 0.7.0.

## v0.6.2 2025 08 24

### Added

- Integrated Vitest for comprehensive unit testing.

### Fixed

- Updated version badges in README for consistency.

### Changed

- Bumped version to 0.6.2.

## v0.6.0 2025 08 23

### Changed

- Minor release.

## v0.5.1 2025 08 23

### Added

- Improved error handling in `src/index.ts` to gracefully manage unknown error types.

### Changed

- Updated `package.json` to include linting and formatting in the `prepare` script, ensuring code quality before building.

## v0.5.0 2025 08 23

### Changed

- Minor release.

## v0.4.0 2025 08 23

### Changed

- Minor release.

## v0.3.1 2025 08 23

### Changed

- Moved release creation to separate workflow.

## v0.3.0 2025 08 23

### Changed

- CI: Version bump updated.
- Refactored: pnpm version updated.
- CI: Pipeline improvement.

### Fixed

- The version struct updated.

## v0.2.1 2025 08 22

### Added

- Added PHP support.
- Added tag and release workflow.
- Automated release creation with release notes.

### Changed

- Refactored: Added multi-platform support.

## v0.2.0 2025 08 22

### Added

- Added PHP support.
- Added tag and release workflow.
- Automated release creation with release notes.

### Changed

- Refactored: Added multi-platform support.

## v0.1.8 2025 08 22

### Changed

- Bumped version to 0.1.8.
- Refactored: Place changed.

## v0.1.7 2025 08 22

### Added

- Security file added.

### Changed

- Bumped version to 0.1.7.

## v0.1.6 2025 08 22

### Changed

- Bumped version to 0.1.6.
- Updated README.

## v0.1.5 2025 08 22

### Changed

- Bumped version to 0.1.5.
- Updated README.

## v0.1.4 2025 08 22

### Fixed

- Updated release workflow.

### Changed

- Bumped version to 0.1.4.

## v0.1.2 2025 08 22

### Added

- Version bumped 0.1.2.

### Changed

- Bumped version to 0.1.2.

## v0.1.1 2025 08 22

### Added

- Pnpm setup in the release yml.
- Version bump minor release 0.1.0.

### Changed

- CI: Fallback added.
- Bumped version to 0.1.1.
- CI removed.
- CI path updated.

## v0.1.0 2025 08 22

### Added

- Contribution guidelines.
- Code of Conduct (COC).
- Developer guide.
- Initial action.
- Write permission added in the release.yml.
- CI release added.

### Changed

- CI: Keep the versions up-to-date.
- Updated.
- Build: Update build script.
- Updated readme.
