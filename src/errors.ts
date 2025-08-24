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
