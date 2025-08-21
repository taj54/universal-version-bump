import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { detectPlatform, updateVersion } from "./utils";
import semver from "semver";

async function run() {
  try {
    const releaseType = (core.getInput("release_type") || "patch") as semver.ReleaseType;

    const platform = detectPlatform();
    core.info(`Detected platform: ${platform}`);

    const version = updateVersion(platform, releaseType);
    core.setOutput("new_version", version);

    // Git Commit & Tag
    await exec.exec("git", ["config", "user.name", "github-actions[bot]"]);
    await exec.exec("git", ["config", "user.email", "github-actions[bot]@users.noreply.github.com"]);

    await exec.exec("git", ["add", "-A"]);
    await exec.exec("git", ["diff-index", "--quiet", "HEAD"]).catch(async () => {
      await exec.exec("git", ["commit", "-m", `chore: bump version to ${version}`]);
    });

    await exec.exec("git", ["tag", `v${version}`]);
    await exec.exec("git", ["push", "origin", "HEAD", "--tags"]);

  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
