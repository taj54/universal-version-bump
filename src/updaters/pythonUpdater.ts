import fs from "fs";
import semver, { ReleaseType } from "semver";
import { Updater } from "../interface";

export class PythonUpdater implements Updater {
  platform = "python";

  canHandle(): boolean {
    return fs.existsSync("pyproject.toml") || fs.existsSync("setup.py");
  }

  getCurrentVersion(): string | null {
    if (fs.existsSync("pyproject.toml")) {
      const content = fs.readFileSync("pyproject.toml", "utf8");
      const match = content.match(/version\s*=\s*"([^"]+)"/);
      return match ? match[1] : null;
    }
    if (fs.existsSync("setup.py")) {
      const content = fs.readFileSync("setup.py", "utf8");
      const match = content.match(/version\s*=\s*["']([^"']+)["']/);
      return match ? match[1] : null;
    }
    return null;
  }

  bumpVersion(releaseType: ReleaseType): string {
    const current = this.getCurrentVersion();
    if (!current) throw new Error("Python version not found");

    const newVersion = semver.inc(current, releaseType) || current;

    if (fs.existsSync("pyproject.toml")) {
      let content = fs.readFileSync("pyproject.toml", "utf8");
      content = content.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
      fs.writeFileSync("pyproject.toml", content);
    } else if (fs.existsSync("setup.py")) {
      let content = fs.readFileSync("setup.py", "utf8");
      content = content.replace(/version\s*=\s*["'][^"']+["']/, `version="${newVersion}"`);
      fs.writeFileSync("setup.py", content);
    }

    return newVersion;
  }
}
