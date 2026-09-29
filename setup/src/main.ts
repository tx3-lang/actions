import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { getTarget } from "./platform";
import {
  getTx3upDownloadUrl,
  downloadAndCacheTx3up,
  runTx3upInstall,
} from "./installer";

// Reads the bare version from a tool's `<name> <version>` banner.
async function toolVersion(tool: string, binPath: string): Promise<string> {
  try {
    const { stdout } = await exec.getExecOutput(tool, ["--version"], {
      env: {
        ...process.env,
        PATH: `${binPath}:${process.env.PATH}`,
      },
      silent: true,
    });
    return stdout.trim().split(/\s+/).pop() ?? "";
  } catch {
    core.warning(`Could not determine ${tool} version`);
    return "";
  }
}

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

    const tx3Version = await toolVersion("tx3c", binPath);
    const trixVersion = await toolVersion("trix", binPath);

    core.setOutput("tx3-version", tx3Version);
    core.setOutput("trix-version", trixVersion);
    core.info(`tx3 toolchain installed successfully`);
    core.info(`  bin-path: ${binPath}`);
    core.info(`  tx3-version: ${tx3Version}`);
    core.info(`  trix-version: ${trixVersion}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

run();
