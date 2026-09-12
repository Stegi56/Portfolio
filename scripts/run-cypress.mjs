import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { browserIdentity, browserPolicy, ensureBrowser } from "./test-browsers.mjs";

const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;

const cypressCli = fileURLToPath(new URL("../node_modules/cypress/bin/cypress", import.meta.url));
const args = process.argv.slice(2);
const command = args.shift() ?? "run";
const browserArgument = args.findIndex((arg) => arg === "--browser" || arg.startsWith("--browser="));
let selected;
if (browserArgument >= 0) {
  const option = args[browserArgument];
  selected = option.includes("=") ? args.splice(browserArgument, 1)[0].slice("--browser=".length) : args.splice(browserArgument, 2)[1];
  if (!selected || selected.startsWith("--")) throw new Error("--browser needs chrome, firefox, edge, or an explicit executable path.");
}

function cypress(browser, extraEnvironment = {}) {
  return spawnSync(process.execPath, [cypressCli, command, ...args, ...(browser ? ["--browser", browser] : [])], {
    env: { ...environment, ...extraEnvironment }, stdio: "inherit", windowsHide: true,
  }).status ?? 1;
}

// Explicit executable paths are diagnostic runs, not a substitute for the pinned defaults.
if (!["run", "open"].includes(command)) process.exit(cypress(selected));
if (selected && !browserPolicy.browsers[selected]) {
  if (!existsSync(selected)) throw new Error(`Unknown pinned browser '${selected}'. Choose chrome, firefox, edge, or an existing executable path.`);
  console.log(`Diagnostic browser path (not a pinned-default run): ${selected}`);
  process.exit(cypress(selected));
}

const names = selected ? [selected] : command === "open" ? ["chrome"] : Object.keys(browserPolicy.browsers);
const browsers = [];
for (const name of names) {
  const browser = await ensureBrowser(name);
  const actual = browserIdentity(browser.executable);
  if (!actual.product.toLowerCase().includes(name) || actual.version !== browser.version) {
    throw new Error(`Expected ${name} ${browser.version}; found ${actual.product} ${actual.version}`);
  }
  browsers.push(browser);
}

if (command === "run" && environment.PORTFOLIO_SKIP_BUILD !== "1") {
  const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
  const build = spawnSync(process.execPath, [nextCli, "build"], { stdio: "inherit", windowsHide: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
  environment.PORTFOLIO_SKIP_BUILD = "1";
}

let failed = false;
for (const browser of browsers) {
  console.log(`Testing pinned ${browser.name} ${browser.version}`);
  if (browser.name === "firefox") {
    console.log("Firefox runs the shared behavior checks; the two Chromium CDP native-touch/media checks are explicitly pending.");
  }
  const status = cypress(browser.name, { PORTFOLIO_TEST_BROWSER: JSON.stringify(browser) });
  failed ||= status !== 0;
}
process.exit(failed ? 1 : 0);
