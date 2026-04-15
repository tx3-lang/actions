import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { getTarget } from "./platform";
import {
  getTx3upDownloadUrl,
  downloadAndCacheTx3up,
  runTx3upInstall,
} from "./installer";

async function run(): Promise<void> {
  try {
    const channel = core.getInput("channel") || "stable";
    const version = core.getInput("version") || undefined;
    const token = core.getInput("github-token");

    const target = getTarget();

    const { url, version: tx3upVersion } = await getTx3upDownloadUrl(
      target,
      token
    );

    const tx3upDir = await downloadAndCacheTx3up(url, tx3upVersion, target);

    // Export token so tx3up can make authenticated GitHub API requests
    if (token) {
      core.exportVariable("GITHUB_TOKEN", token);
    }

    const binPath = await runTx3upInstall(tx3upDir, channel, version);

    core.addPath(binPath);
    core.setOutput("bin-path", binPath);

    // Get installed version
    let tx3Version = "";
    try {
      let output = "";
      await exec.exec("tx3c", ["--version"], {
        env: {
          ...process.env,
          PATH: `${binPath}:${process.env.PATH}`,
        },
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          },
        },
      });
      tx3Version = output.trim();
    } catch {
      core.warning("Could not determine tx3c version");
    }

    core.setOutput("tx3-version", tx3Version);
    core.info(`tx3 toolchain installed successfully`);
    core.info(`  bin-path: ${binPath}`);
    core.info(`  tx3-version: ${tx3Version}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

run();
