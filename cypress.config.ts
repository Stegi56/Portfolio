import { defineConfig } from "cypress";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

let previewUrl = "";
let previewProcess: ChildProcess | undefined;

export default defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:4173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    async setupNodeEvents(on, config) {
      buildStaticSite();
      const previewPort = await findAvailablePort();
      previewUrl = `http://127.0.0.1:${previewPort}`;
      previewProcess = await startPreviewServer(previewPort);
      config.baseUrl = previewUrl;

      on("task", {
        log(message: string) {
          console.log(message);
          return null;
        },
      });

      on("after:run", stopPreviewServer);
      process.once("exit", stopPreviewServer);
      return config;
    },
  },
  video: false,
  screenshotOnRunFailure: true,
});

function buildStaticSite() {
  const nextCli = fileURLToPath(new URL("./node_modules/next/dist/bin/next", import.meta.url));
  const result = spawnSync(process.execPath, [nextCli, "build"], { stdio: "inherit" });

  if (result.status !== 0) {
    throw result.error ?? new Error(`Static build failed with exit code ${result.status ?? "unknown"}`);
  }
}

async function startPreviewServer(port: number) {
  const serveCli = fileURLToPath(new URL("./node_modules/serve/build/main.js", import.meta.url));
  const child = spawn(
    process.execPath,
    [serveCli, "out", "-l", String(port), "-L", "-n", "--no-port-switching"],
    { stdio: "inherit" },
  );

  await waitForPreview(child);
  return child;
}

function findAvailablePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a local preview port"));
        return;
      }

      server.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

async function waitForPreview(child: ChildProcess) {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Preview server exited with code ${child.exitCode}`);
    }

    if (await isPreviewReady()) return;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  child.kill();
  throw new Error(`Preview server did not become ready at ${previewUrl}`);
}

async function isPreviewReady() {
  try {
    const response = await fetch(previewUrl);
    return response.ok;
  } catch {
    return false;
  }
}

function stopPreviewServer() {
  if (previewProcess?.exitCode === null) previewProcess.kill();
  previewProcess = undefined;
}
