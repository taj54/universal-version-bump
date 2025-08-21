# Universal Version Bump

[![Release](https://github.com/taj54/universal-version-bump/actions/workflows/release.yml/badge.svg)](https://github.com/taj54/universal-version-bump/actions/workflows/release.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A GitHub Action to automatically bump versions for any project that has a version file.

This action will automatically detect the version file (e.g. `package.json`, `pyproject.toml`, etc.) and bump the version according to the `release_type` input. If multiple version files are found, the action will use the one that is most commonly used for the project type.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Bump version
  uses: Taj/universal-version-bump@v1
  with:
    release_type: "patch" # patch, minor, or major
```

## Inputs

| Name           | Description                                   | Default |
| -------------- | --------------------------------------------- | ------- |
| `release_type` | Select the version bump type (patch, minor, major) | `patch` |
| `git_tag`      | Whether to create a Git tag after bump        | `true`  |

## Outputs

| Name          | Description                            |
| ------------- | -------------------------------------- |
| `new_version` | The new bumped version                 |
| `tag`         | The created Git tag (if enabled)       |

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
        uses: Taj/universal-version-bump@v1
        with:
          release_type: "patch"
```

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

