#!/usr/bin/env node

// FOLDER (.ribbon)
// |- launcher.exe (start up a new terminal) 
// |- ribbon.exe (handle ribbon logics)
// |- misc (miscelaneous things)
// /-- ribbon_config.json (config for ribbon)
// /-- alias-macro.json (saving macro)
// /-- scripts (saving script)
// /-- commands (saving commands)
// |- launcher_config.json (config for launcher)


// initialize files
import './src/logics/path.ts'

// initialize env
import "./env.ts";

// import controller
import "./control/controller.ts";