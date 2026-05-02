#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import al from "./src/async_loader.ts";
import { pallete } from "./src/logics/utils/color.ts";
import {spawnChild} from "./src/api/spawn.ts";

const { chalk } = al;

import readline from "readline";
import { execPath } from "process";

// Node.js ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root_path = {
  // root when packed
  fromExec: path.dirname(execPath),

  // root when dev
  fromDev: __dirname,
};

const exeName = "ribbon.exe";

process.env.ROOT_STATUS = false; // allow user to switch admin mode
process.env.GET_ROOT = undefined; // get the root path
process.env.INDEX_FILE = undefined; // get the entry point of the application

if (root_path.fromExec.includes(exeName)) {
  // top dir
  process.env.GET_ROOT = path.join(root_path.fromExec, "..");
  // point to exe file
  process.env.INDEX_FILE = root_path.fromExec;
} else {
  // dev mode
  process.env.GET_ROOT = root_path.fromDev;
  process.env.INDEX_FILE = path.join(__dirname, "src", "logics", "index.ts");
}

const index = () => {
  if (process.env.INDEX_FILE.includes(".ts"))
    return `bun "${process.env.INDEX_FILE}"`;
  else return `"${process.env.INDEX_FILE}"`;
};

// readline logic
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let activeController = null;

// Global SIGINT handler to prevent memory leaks and handle aborts properly
rl.on("SIGINT", () => {
  if (activeController) {
    console.log("\n[!] aborted by user\n");
    activeController.abort(); // Kills the running child process via AbortSignal
  } else {
    // If no process is running, Ctrl+C closes the REPL entirely
    console.log("\n\nExiting Ribbon...");
    process.exit(0);
  }
});

const startLoop = async () => {
  rl.question(
    `(${process.env.ROOT_STATUS ? "root" : "normal"}) Ribbon > `,
    async (answer) => {
      
      const trimmed = answer.trim();

      if (trimmed === "rib exit") {
        rl.close();
        return;
      }

      if (!trimmed) {
        startLoop();
        return;
      }

      try {
        if (answer.startsWith("rib ")) {
          answer = answer.replace("rib ", index());
        }

        console.log(`\n${chalk.hex(pallete.grey_4)("Running : ")}${answer}\n`);

        // Create a new AbortController for this specific command execution
        activeController = new AbortController();
        
        // Pass the signal down to spawnChild
        await spawnChild(answer, activeController.signal);

      } catch (e) {
        if (e !== false) {
          console.log("something went wrong: ", e);
        }
      } finally {
        // Clear the controller once the process naturally exits or gets killed
        activeController = null;
        // Resume the loop to show the prompt again
        startLoop();
      }

    },
  );
};

startLoop();
