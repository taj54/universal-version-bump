/**
 * Base class for custom errors.
 */
class CustomError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

/**
 * Error thrown when platform detection fails.
 */
export class PlatformDetectionError extends CustomError {
  constructor(message: string) {
    super(message, 'PlatformDetectionError');
  }
}

/**
 * Error thrown when version bumping fails.
 */
export class VersionBumpError extends CustomError {
  constructor(message: string) {
    super(message, 'VersionBumpError');
  }
}

/**
 * Error thrown when a file is not found.
 */
export class FileNotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 'FileNotFoundError');
  }
}

/**
 * Error thrown when a manifest file is invalid.
 */
export class InvalidManifestError extends CustomError {
  constructor(message: string) {
    super(message, 'InvalidManifestError');
  }
}

/**
 * Error thrown when the changelog file is not found.
 */
export class ChangelogFileNotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 'ChangelogFileNotFoundError');
  }
}
