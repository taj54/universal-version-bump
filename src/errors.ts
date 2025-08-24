export class PlatformDetectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlatformDetectionError';
  }
}

export class VersionBumpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionBumpError';
  }
}

export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFoundError';
  }
}

export class InvalidManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidManifestError';
  }
}
