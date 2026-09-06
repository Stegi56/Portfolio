import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;

const cypressCli = fileURLToPath(new URL("../node_modules/cypress/bin/cypress", import.meta.url));
const result = spawnSync(process.execPath, [cypressCli, ...process.argv.slice(2)], {
  env: environment,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
