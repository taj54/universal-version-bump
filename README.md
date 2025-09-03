# Universal Version Bump

[![GitHub Marketplace](https://img.shields.io/badge/marketplace-universal--version--bump-blue?logo=github)](https://github.com/marketplace/actions/universal-version-bump)
[![Release](https://img.shields.io/github/v/release/taj54/universal-version-bump?label=version)](https://github.com/taj54/universal-version-bump/releases)
[![Test](https://github.com/taj54/universal-version-bump/actions/workflows/test.yml/badge.svg)](https://github.com/taj54/universal-version-bump/actions/workflows/test.yml)
[![License](https://img.shields.io/github/license/taj54/universal-version-bump)](LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-enforced-blue)](CODE_OF_CONDUCT.md)

A GitHub Action to automatically bump versions for any project that has a version file.

This action will automatically detect the version file and bump the version according to the `release_type` input. If multiple version files are found, the action will use the one that is most commonly used for the project type.

## How it works

The action will first try to detect the platform of the project by looking for common version files in the root directory. The following files are supported:

| Platform | Version File                 |
| -------- | ---------------------------- |
| Docker   | `Dockerfile`                 |
| Go       | `go.mod`                     |
| Node     | `package.json`               |
| PHP      | `composer.json`              |
| Python   | `pyproject.toml`, `setup.py` |
| Rust     | `Cargo.toml`                 |

If a version file is found, the action will bump the version in that file. If no version file is found, the action will fail.

You can also explicitly specify the platform to update by using the `target_platform` input. This is useful for monorepos or projects with multiple potential manifest files.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Bump version
  uses: taj54/universal-version-bump@v0.8.2
  with:
    release_type: 'patch' # patch, minor, or major
```

### Bumping a version in a specific directory

To bump a version in a specific directory, use the `target_path` input:

```yaml
- name: Bump version in my-app
  uses: taj54/universal-version-bump@v0.8.2
  with:
    release_type: 'patch'
    target_path: 'my-app'
```

### Explicitly targeting a platform

To explicitly target a platform, use the `target_platform` input:

```yaml
- name: Bump Node.js version
  uses: taj54/universal-version-bump@v0.8.2
  with:
    release_type: 'patch'
    target_platform: 'node' # Explicitly target Node.js
```

### Custom Updater Usage

For custom version updates in arbitrary files, use `target_platform: 'custom'` along with the `bump_targets` input. The `bump_targets` input should be a JSON array of objects, where each object specifies the `path` to the file and the `variable` name containing the version.

For JSON files, the `variable` should be the JSON path to the version field. For other text files, the `variable` will be used in a regular expression to find and replace the version.

```yaml
- name: Bump custom version
  uses: taj54/universal-version-bump@v0.8.2
  with:
    release_type: 'patch'
    target_platform: 'custom'
    bump_targets: |
      [
        {"path": "version.txt", "variable": "APP_VERSION"},
        {"path": "config.json", "variable": "app.version"}
      ]
```

## Inputs

| Name              | Description                                                                                                                                                                                                                                      | Default |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `release_type`    | Select the version bump type (patch, minor, major)                                                                                                                                                                                               | `patch` |
| `git_tag`         | Whether to create a Git tag after bump                                                                                                                                                                                                           | `true`  |
| `target_platform` | Explicitly specify the platform to update (e.g., `node`, `python`). If not provided, the platform will be detected automatically.                                                                                                                | `''`    |
| `target_path`     | The target path where the version bump should be applied. If not provided, the action will run in the root directory.                                                                                                                            | `.`     |
| `bump_targets`    | Optional list of version update targets. Provide the `path` and the `variable` to update, the Action will build regex automatically. Example: `[{"path": "setup.py", "variable": "version"}, {"path": "Dockerfile", "variable": "APP_VERSION"}]` | `[]`    |

## Outputs

| Name          | Description                      |
| ------------- | -------------------------------- |
| `new_version` | The new bumped version           |
| `tag`         | The created Git tag (if enabled) |

## Example Workflow

```yaml
name: Version Bump

permissions:
  contents: write
  pull-requests: write

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Select version bump type'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Universal Version Bump
        uses: taj54/universal-version-bump@v0.9.0
        with:
          release_type: ${{ inputs.release_type }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Development

For more information on how to develop this action, see the [developer guide](DEVELOPER.md).

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more information.

## Code of Conduct

This project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
