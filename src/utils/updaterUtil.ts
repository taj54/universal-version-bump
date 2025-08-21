import semver from "semver";
import { Updater } from "../interface";
import { DockerUpdater, GoUpdater, NodeUpdater, PythonUpdater, RustUpdater  } from "../updaters";

const updaters: Updater[] = [
  new NodeUpdater(),
  new PythonUpdater(),
  new RustUpdater(),
  new GoUpdater(),
  new DockerUpdater(),
];

export function detectPlatform(): string {
  const updater = updaters.find(u => u.canHandle());
  return updater ? updater.platform : "unknown";
}

export function updateVersion(platform: string, releaseType: semver.ReleaseType): string {
  const updater = updaters.find(u => u.platform === platform);
  if (!updater) throw new Error(`No updater found for platform: ${platform}`);
  return updater.bumpVersion(releaseType);
}
