# Universal Version Bump

[![GitHub Marketplace](https://img.shields.io/badge/marketplace-universal--version--bump-blue?logo=github)](https://github.com/marketplace/actions/universal-version-bump)
[![Release](https://img.shields.io/github/v/release/taj54/universal-version-bump?label=version)](https://github.com/taj54/universal-version-bump/releases)
[![Test](https://github.com/taj54/universal-version-bump/actions/workflows/test.yml/badge.svg)](https://github.com/taj54/universal-version-bump/actions/workflows/test.yml)
[![License](https://img.shields.io/github/license/taj54/universal-version-bump)](LICENSE)

A GitHub Action to automatically bump versions for any project that has a version file.

This action will automatically detect the version file (e.g. `package.json`, `pyproject.toml`, etc.) and bump the version according to the `release_type` input. If multiple version files are found, the action will use the one that is most commonly used for the project type.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Bump version
  uses: taj54/universal-version-bump@v0.8.2
  with:
    release_type: 'patch' # patch, minor, or major
```

## Inputs

| Name              | Description                                                                                                                       | Default |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `release_type`    | Select the version bump type (patch, minor, major)                                                                                | `patch` |
| `git_tag`         | Whether to create a Git tag after bump                                                                                            | `true`  |
| `target_platform` | Explicitly specify the platform to update (e.g., `node`, `python`). If not provided, the platform will be detected automatically. | `''`    |
| `target_path`     | The target path where the version bump should be applied. If not provided, the action will run in the root directory.             | `.`     |

### Explicit Platform Targeting (`target_platform`)

By default, the action automatically detects the project's platform based on common manifest files (e.g., `package.json` for Node.js, `pyproject.toml` for Python). However, in certain scenarios, such as monorepos or projects with multiple potential manifest files, you might want to explicitly control which platform's version is bumped.

The `target_platform` input allows you to specify the exact platform you intend to update. When this input is provided, the action will bypass its automatic detection and directly attempt to update the version for the specified platform.

Supported platforms include:

- `node` (for Node.js projects using `package.json`)
- `python` (for Python projects using `pyproject.toml` or `setup.py`)
- `docker` (for Docker projects using `Dockerfile`)
- `go` (for Go projects using `go.mod`)
- `php` (for PHP projects using `composer.json`)
- `rust` (for Rust projects using `Cargo.toml`)

**Example:**

```yaml
- name: Bump Node.js version
  uses: taj54/universal-version-bump@v0.8.2
  with:
    release_type: 'patch'
    target_platform: 'node' # Explicitly target Node.js
```

## Outputs

| Name          | Description                      |
| ------------- | -------------------------------- |
| `new_version` | The new bumped version           |
| `tag`         | The created Git tag (if enabled) |

## Example Workflow

```yaml
name: Bump Version

on:
  push:
    branches:
      - main

jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Bump version
        uses: taj54/universal-version-bump@v0.8.2
        with:
          release_type: 'patch'
```

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
