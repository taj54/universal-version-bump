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

-   `src/`: Contains the main source code for the action.
    -   `updaters/`: Contains logic for bumping versions for different platforms (e.g., `nodeUpdater.ts`, `pythonUpdater.ts`).
    -   `services/`: Contains core services like Git operations and the main updater logic.
    -   `utils/`: Utility functions.
-   `tests/`: Contains unit tests for the source code.
-   `dist/`: Compiled JavaScript output.
-   `scripts/`: Build scripts.

## GitHub Action Inputs

This action accepts the following inputs:

| Name              | Description                                                                                                                       | Required | Default |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `release_type`    | Select the version bump type (patch, minor, major)                                                                                | `true`   | `patch` |
| `git_tag`         | Whether to create a Git tag after bump                                                                                            | `false`  | `true`  |
| `target_platform` | Explicitly specify the platform to update (e.g., `node`, `python`). If not provided, the platform will be detected automatically. | `false`  | `''`    |
| `target_path`     | The target path where the version bump should be applied. If not provided, the action will run in the root directory.         | `false`  | `.`     |

## Submitting Changes

When you're ready to submit your changes, please follow these steps:

1.  Create a new branch for your changes.
2.  Make your changes and commit them with a descriptive commit message.
3.  Push your changes to your forked repository.
4.  Create a pull request to the `main` branch of this repository.

We'll review your pull request as soon as possible. Thanks for your contribution!
