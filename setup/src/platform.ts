import * as core from "@actions/core";

export function getTarget(): string {
  const arch = process.arch;
  const platform = process.platform;

  let targetArch: string;
  switch (arch) {
    case "x64":
      targetArch = "x86_64";
      break;
    case "arm64":
      targetArch = "aarch64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }

  let targetOs: string;
  switch (platform) {
    case "linux":
      targetOs = "unknown-linux-gnu";
      break;
    case "darwin":
      targetOs = "apple-darwin";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  const target = `${targetArch}-${targetOs}`;
  core.info(`Detected platform: ${target}`);
  return target;
}
