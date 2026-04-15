import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as exec from "@actions/exec";
import * as path from "path";
import * as os from "os";

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: GitHubAsset[];
}

export async function getTx3upDownloadUrl(
  target: string,
  token: string
): Promise<{ url: string; version: string }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "tx3-actions",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const response = await fetch(
    "https://api.github.com/repos/tx3-lang/up/releases/latest",
    { headers }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tx3up release: ${response.status} ${response.statusText}`
    );
  }

  const release: GitHubRelease = await response.json();
  const assetName = `tx3up-${target}`;

  const asset = release.assets.find((a) => a.name.includes(assetName));
  if (!asset) {
    const available = release.assets.map((a) => a.name).join(", ");
    throw new Error(
      `No tx3up binary found for platform ${target}. Available assets: ${available}`
    );
  }

  core.info(`Found tx3up asset: ${asset.name} (${release.tag_name})`);
  return { url: asset.browser_download_url, version: release.tag_name };
}

export async function downloadAndCacheTx3up(
  url: string,
  version: string,
  target: string
): Promise<string> {
  const toolName = "tx3up";

  // Check cache first
  const cached = tc.find(toolName, version, target);
  if (cached) {
    core.info(`Found tx3up in cache: ${cached}`);
    return cached;
  }

  core.info(`Downloading tx3up from: ${url}`);
  const archivePath = await tc.downloadTool(url);

  let extractedPath: string;
  if (url.endsWith(".tar.xz")) {
    extractedPath = await tc.extractTar(archivePath, undefined, ["xJ"]);
  } else {
    extractedPath = await tc.extractTar(archivePath);
  }

  // Archive contains a nested directory (e.g. tx3up-x86_64-unknown-linux-gnu/)
  const nestedDir = path.join(extractedPath, `tx3up-${target}`);
  const cachedPath = await tc.cacheDir(nestedDir, toolName, version, target);
  core.info(`Cached tx3up to: ${cachedPath}`);
  return cachedPath;
}

export async function runTx3upInstall(
  tx3upDir: string,
  channel: string,
  version?: string
): Promise<string> {
  const tx3Root = path.join(os.homedir(), ".tx3");
  const tx3upBin = path.join(tx3upDir, "tx3up");

  // Ensure binary is executable
  await exec.exec("chmod", ["+x", tx3upBin]);

  const args = ["install"];
  if (version) {
    args.push("--release", version);
  }

  core.info(
    `Running tx3up install (channel: ${channel}${version ? `, version: ${version}` : ""})...`
  );

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    TX3_ROOT: tx3Root,
    TX3_CHANNEL: channel,
  };

  // Pass GitHub token so tx3up can make authenticated API requests
  const token = process.env.GITHUB_TOKEN || "";
  if (token) {
    env["GITHUB_TOKEN"] = token;
  }

  await exec.exec(tx3upBin, args, { env });

  const binPath = path.join(tx3Root, "default", "bin");
  return binPath;
}
