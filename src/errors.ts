/**
 * Error thrown when platform detection fails.
 */
export class PlatformDetectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlatformDetectionError';
  }
}

/**
 * Error thrown when version bumping fails.
 */
export class VersionBumpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionBumpError';
  }
}

/**
 * Error thrown when a file is not found.
 */
export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFoundError';
  }
}

/**
 * Error thrown when a manifest file is invalid.
 */
export class InvalidManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidManifestError';
  }
}
