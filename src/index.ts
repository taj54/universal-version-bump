import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as fs from "fs";
import semver from "semver";

async function run() {
  try {
    const releaseType = core.getInput("release_type") || "patch";

    let version = "0.1.0";

    if (fs.existsSync("package.json")) {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      version = semver.inc(pkg.version, releaseType as semver.ReleaseType) || pkg.version;
      pkg.version = version;
      fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    }

    core.setOutput("new_version", version);

    await exec.exec("git", ["config", "user.name", "github-actions"]);
    await exec.exec("git", ["config", "user.email", "github-actions@github.com"]);
    await exec.exec("git", ["commit", "-am", `chore: bump version to ${version}`]);
    await exec.exec("git", ["tag", `v${version}`]);
    await exec.exec("git", ["push", "origin", "HEAD", "--tags"]);

  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
