import { defineConfig } from "cypress";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { browserIdentity } from "./scripts/test-browsers.mjs";

let previewUrl = "";
let previewProcess: ChildProcess | undefined;
const expected = process.env.PORTFOLIO_TEST_BROWSER ? JSON.parse(process.env.PORTFOLIO_TEST_BROWSER) : undefined;

export default defineConfig({
  screenshotsFolder: expected ? join("cypress", "screenshots", expected.name) : "cypress/screenshots/diagnostic",
  env: {
    viewport: process.env.PORTFOLIO_VIEWPORT || "all",
  },
  e2e: {
    baseUrl: "http://127.0.0.1:4173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    async setupNodeEvents(on, config) {
      if (expected) {
        const actual = browserIdentity(expected.executable);
        config.browsers = config.browsers.filter((browser) => browser.name !== expected.name);
        config.browsers.push({
          name: expected.name, family: expected.name === "firefox" ? "firefox" : "chromium",
          channel: "stable", displayName: actual.product, version: actual.version,
          majorVersion: Number(actual.version.split(".")[0]), path: expected.executable,
          isHeaded: !config.isTextTerminal, isHeadless: Boolean(config.isTextTerminal),
        });
      }
      on("before:browser:launch", (browser, launchOptions) => {
        if (expected) {
          const actual = browserIdentity(browser.path);
          if (browser.name !== expected.name || resolve(browser.path) !== resolve(expected.executable)
            || actual.version !== expected.version || !actual.product.toLowerCase().includes(expected.name)) {
            throw new Error(`Pinned browser mismatch: expected ${expected.name} ${expected.version}, found ${actual.product} ${actual.version}`);
          }
          console.log(`Verified browser: ${actual.product} ${actual.version}`);
        }
        if (browser.family === "chromium") launchOptions.args.push("--window-size=1600,1200");
        if (browser.name === "chrome" && browser.isHeadless) {
          // Chrome 109 supports unified headless; Cypress 14 selects its older compositor.
          // Compatibility review: https://github.com/Stegi56/Portfolio/issues/3
          launchOptions.args = launchOptions.args.map((arg) => arg === "--headless" ? "--headless=new" : arg);
        }
        if (browser.family === "firefox") {
          launchOptions.preferences["dom.w3c_touch_events.enabled"] = 1;
          launchOptions.env = { ...launchOptions.env, MOZ_HEADLESS_WIDTH: "1600", MOZ_HEADLESS_HEIGHT: "1200" };
        }
        return launchOptions;
      });
      // CI workers share the build artifact; local runs build fresh by default.
      if (process.env.PORTFOLIO_SKIP_BUILD === "1") {
        if (!existsSync("out/index.html")) throw new Error("Expected an existing static build at out/index.html");
      } else {
        buildStaticSite();
      }
      const previewPort = await findAvailablePort();
      previewUrl = `http://127.0.0.1:${previewPort}`;
      previewProcess = await startPreviewServer(previewPort);
      config.baseUrl = previewUrl;

      on("task", {
        publishedBlogPaths() {
          // Use the source files, independently of what the rendered index lists.
          const directory = join(process.cwd(), "src", "data", "blog");
          return readdirSync(directory, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && existsSync(join(directory, entry.name, "blog.mdx")))
            .map((entry) => `/blog/${entry.name}/`)
            .sort();
        },
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
