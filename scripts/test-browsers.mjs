import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

export const browserPolicy = JSON.parse(readFileSync(new URL("../test-browsers.json", import.meta.url), "utf8"));
const cache = fileURLToPath(new URL("../.cache/test-browsers/", import.meta.url));

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", windowsHide: true });
  if (result.status !== 0) throw result.error ?? new Error(`${command} exited with ${result.status}`);
}

async function download(url, destination, expectedHash) {
  const cached = existsSync(destination);
  const file = cached ? destination : `${destination}.partial`;
  try {
    if (!cached) {
      console.log(`Downloading ${url}`);
      const response = await fetch(url);
      if (!response.ok || !response.body) throw new Error(`Download failed: ${response.status} ${url}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(file));
    }
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(file)) hash.update(chunk);
    if (hash.digest("hex") !== expectedHash.toLowerCase()) {
      throw new Error(`Checksum mismatch: ${destination}. Remove this cached download before retrying.`);
    }
    if (!cached) renameSync(file, destination);
  } finally {
    if (!cached) rmSync(file, { force: true });
  }
}

/** Install isolated browser files; never replace the user's normal browser. */
export async function ensureBrowser(name) {
  const browser = browserPolicy.browsers[name];
  if (!browser) throw new Error(`Unknown browser '${name}'. Choose ${Object.keys(browserPolicy.browsers).join(", ")}.`);
  const artifact = browser[process.platform];
  if (!artifact) throw new Error(`Pinned ${name} setup supports Windows and Linux; ${process.platform} is not configured.`);
  const directory = join(cache, `${name}-${artifact.version}`);
  const executable = join(directory, artifact.executable);
  const completionMarker = join(directory, ".complete");
  if (existsSync(completionMarker) && existsSync(executable)) return { name, version: artifact.version, executable };
  mkdirSync(directory, { recursive: true });

  if (artifact.image) {
    // Google no longer serves this Linux release. Cypress's immutable image retains it.
    const result = spawnSync("docker", ["create", "--platform", "linux/amd64", artifact.image], { encoding: "utf8" });
    if (result.status !== 0) throw result.error ?? new Error(`Docker is required to extract Chrome 109: ${result.stderr}`);
    const container = result.stdout.trim();
    try { run("docker", ["cp", `${container}:/opt/google/chrome`, directory]); }
    finally { run("docker", ["rm", container]); }
  } else {
    const archive = join(directory, "download");
    let url = artifact.url;
    if (artifact.downloadInfoUrl && !existsSync(archive)) {
      const response = await fetch(artifact.downloadInfoUrl, { method: "POST" });
      if (!response.ok) throw new Error(`Edge download lookup failed: ${response.status}`);
      const files = await response.json();
      url = files.find((file) => file.FileId === artifact.fileId)?.Url;
      if (!url) throw new Error(`Edge download lookup did not contain ${artifact.fileId}`);
    }
    await download(url, archive, artifact.sha256);
    if (process.platform === "win32") {
      const extractorDirectory = join(cache, "7zip");
      const extractor = join(extractorDirectory, "7z.exe");
      if (!existsSync(extractor)) {
        const bootstrap = join(cache, "7zr.exe"), installer = join(cache, "7zip.exe");
        await download(browserPolicy.extractor.bootstrapUrl, bootstrap, browserPolicy.extractor.bootstrapSha256);
        await download(browserPolicy.extractor.url, installer, browserPolicy.extractor.sha256);
        run(bootstrap, ["x", installer, `-o${extractorDirectory}`, "-y"]);
      }
      run(extractor, ["x", archive, `-o${directory}`, "-y"]);
      if (artifact.nestedArchive) run(extractor, ["x", join(directory, artifact.nestedArchive), `-o${directory}`, "-y"]);
    } else if (artifact.format === "deb") {
      run("dpkg-deb", ["-x", archive, directory]);
    } else {
      run("tar", ["-xf", archive, "-C", directory]);
    }
  }
  if (!existsSync(executable)) throw new Error(`Extraction did not create ${executable}`);
  const identity = browserIdentity(executable);
  if (identity.version !== artifact.version || !identity.product.toLowerCase().includes(name)) {
    throw new Error(`Extracted browser mismatch: ${identity.product} ${identity.version}`);
  }
  writeFileSync(completionMarker, `${name} ${artifact.version}\n`);
  return { name, version: artifact.version, executable };
}

/** Read the installed binary, not a filename or a supplied user-agent string. */
export function browserIdentity(executable) {
  if (process.platform === "win32") {
    const literalPath = executable.replaceAll("'", "''");
    const command = `$browserFile = Get-Item -LiteralPath '${literalPath}'; @{product=$browserFile.VersionInfo.ProductName;version=$browserFile.VersionInfo.ProductVersion} | ConvertTo-Json -Compress`;
    const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", command], { encoding: "utf8", windowsHide: true });
    if (result.status !== 0) throw new Error(`Cannot identify browser: ${result.stderr}`);
    return JSON.parse(result.stdout);
  }
  const result = spawnSync(executable, ["--version"], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Cannot identify browser: ${result.stderr}`);
  const version = result.stdout.match(/\d+(?:\.\d+)+/)?.[0];
  if (!version) throw new Error(`Unexpected browser version output: ${result.stdout}`);
  return { product: result.stdout.trim(), version };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const name of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(browserPolicy.browsers)) {
    console.log(await ensureBrowser(name));
  }
}
