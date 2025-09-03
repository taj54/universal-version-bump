# Developer Guide

This guide provides instructions for developers who want to contribute to this project.

## Getting Started

To get started, you'll need to have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed on your machine. Then, you can clone the repository and install the dependencies:

```bash
git clone https://github.com/Taj/universal-version-bump.git
cd universal-version-bump
pnpm install
```

## Building

To build the project, run the following command:

```bash
pnpm run build
```

This will compile the TypeScript code and output the JavaScript files in the `dist` directory.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run all tests using the following command:

```bash
pnpm run test
```

## Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting.

To lint your code:

```bash
pnpm run lint
```

To automatically format your code:

```bash
pnpm run format
```

It's recommended to run `pnpm run prepare` before committing, which will lint, format, and build the project.

## Project Structure

The project follows a clear and modular structure to facilitate development and maintenance:

- `src/`: This directory holds the primary source code for the GitHub Action.
  - `config/`: Configuration related files.
  - `interface/`: TypeScript interfaces defining contracts and types used across the application.
  - `registry/`: Manages the registration and retrieval of different updaters.
  - `services/`: Contains core business logic and orchestrates operations, such as Git interactions (`gitService.ts`), changelog generation (`changelogService.ts`), and the main version bumping logic (`updaterService.ts`).
  - `updaters/`: Houses the specific logic for bumping versions across various platforms and file types (e.g., `nodeUpdater.ts` for `package.json`, `pythonUpdater.ts` for Python projects, `customUpdater.ts` for arbitrary files). Each updater implements the `UpdaterInterface`.
  - `utils/`: Provides common utility functions and helper classes used throughout the project, such as file handling (`fileHandler.ts`), JSON manipulation (`jsonUtils.ts`), and version parsing (`versionUtil.ts`).
  - `index.ts`: The main entry point for the GitHub Action.
  - `errors.ts`: Custom error definitions for the application.
- `tests/`: This directory contains all unit tests for the source code, mirroring the `src/` directory structure to ensure comprehensive test coverage.
- `dist/`: This directory stores the compiled JavaScript output and other build artifacts, ready for deployment.
- `scripts/`: Contains various utility scripts, primarily for building and preparing the project.
- `.github/workflows/`: Contains the GitHub Actions workflow definitions for CI/CD, including testing, releasing, and version bumping.

## GitHub Action Inputs

This action accepts the following inputs:

| Name              | Description                                                                                                                       | Required | Default |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `release_type`    | Select the version bump type (patch, minor, major)                                                                                | `true`   | `patch` |
| `git_tag`         | Whether to create a Git tag after bump                                                                                            | `false`  | `true`  |
| `target_platform` | Explicitly specify the platform to update (e.g., `node`, `python`). If not provided, the platform will be detected automatically. | `false`  | `''`    |
| `target_path`     | The target path where the version bump should be applied. If not provided, the action will run in the root directory.             | `false`  | `.`     |

## Submitting Changes

When you're ready to submit your changes, please follow these steps:

1.  Create a new branch for your changes.
2.  Make your changes and commit them with a descriptive commit message.
3.  Push your changes to your forked repository.
4.  Create a pull request to the `main` branch of this repository.

We'll review your pull request as soon as possible. Thanks for your contribution!
