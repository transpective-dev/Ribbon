#!/usr/bin/env node

import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

// Node.js ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const index = `"${path.join(__dirname, "src", "logics", "index.ts")}"`;

// Pass all arguments down to the actual CLI script

// argv is abbreviation of argument vector.
// like, node [arg1] [arg2] [arg3] ...

const args = process.argv.slice(2);

try {
  const bunArgs = [index, ...args];
  const result = spawnSync("bun", bunArgs, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      RIB_RUNTIME: "bun",
    },
  });
} catch {
  // If bun is not installed (ENOENT) or exits with an error code, fallback to npx tsx
  if (result.error || result.status !== 0) {
    console.log(
      "\n[Launcher] Bun execution failed or not found, falling back to npx tsx...\n\n",
    );
    const tsxArgs = ["tsx", index, ...args];
    spawnSync("npx", tsxArgs, {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        RIB_RUNTIME: "npx",
      },
    });
  }
}
