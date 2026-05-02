#!/usr/bin/env node

// FOLDER
// |- launcher.exe (start up a new terminal) 
// |- ribbon.exe (handle ribbon logics)
// |- misc (miscelaneous things)
// /-- ribbon_config.json (config for ribbon)
// /-- alias-macro.json (saving macro)
// /-- scripts (saving script)
// /-- commands (saving commands)
// |- launcher_config.json (config for launcher)

import path from "path";
import { fileURLToPath } from "url";
import al from "./src/async_loader.ts";
import { pallete } from "./src/logics/utils/color.ts";
import { spawnChild } from "./src/api/spawn.ts";

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

const env = process.env;

env.ROOT_STATUS = 'false'; // allow user to switch admin mode
env.GET_ROOT = undefined; // get the root path
env.INDEX_FILE = undefined; // get the entry point of the application

if (root_path.fromExec.includes(exeName)) {
  // top dir
  env.GET_ROOT = path.join(root_path.fromExec, "..");
  // point to exe file
  env.INDEX_FILE = root_path.fromExec;
} else {
  // dev mode
  env.GET_ROOT = root_path.fromDev;
  env.INDEX_FILE = path.join(__dirname, "src", "logics", "index.ts");
}

// readline logic
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let activeController: AbortController | null = null;

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
    `(${process.env.ROOT_STATUS === 'true' ? "root" : "normal"}) Ribbon > `,
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

        if ((/(?:^|\s)\brib\b(?:\s|$)/g).test(answer)) {
          answer = answer.replace(/(?:^|\s)\brib\b(?:\s|$)/g, `bun run "${env.INDEX_FILE}" `);
        }

        // Create the controller early so Ctrl+C during prompt doesn't exit the whole app
        activeController = new AbortController();

        // Pause readline early so it doesn't steal keypresses from execution_guard's enquirer prompt!
        rl.pause();

        console.log(`\n${chalk.hex(pallete.grey_4)("Running : ")}${answer}\n`);

        // Pass the signal down to spawnChild
        await spawnChild({
            cmd: answer,
            signal: activeController.signal,
        });

      } catch (e) {
        
        if (e !== false) {
          
          console.log("something went wrong: ", e);
          
        }
        
      } finally {
                        
        // Clear the controller once the process naturally exits or gets killed
        activeController = null;

        // Resume readline to accept user input again
        rl.resume();

        // Resume the loop to show the prompt again
        startLoop();
        
      }

    },
  );
};

startLoop();
