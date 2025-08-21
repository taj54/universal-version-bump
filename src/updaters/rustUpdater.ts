import fs from "fs";
import semver, { ReleaseType } from "semver";
import { Updater } from "../interface";

export class RustUpdater implements Updater {
  platform = "rust";

  canHandle(): boolean {
    return fs.existsSync("Cargo.toml");
  }

  getCurrentVersion(): string | null {
    if (!this.canHandle()) return null;
    const content = fs.readFileSync("Cargo.toml", "utf8");
    const match = content.match(/version\s*=\s*"([^"]+)"/);
    return match ? match[1] : null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error("Rust version not found");

    const newVersion = semver.inc(current, releaseType) || current;
    let content = fs.readFileSync("Cargo.toml", "utf8");
    content = content.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
    fs.writeFileSync("Cargo.toml", content);

    return newVersion;
  }
}
