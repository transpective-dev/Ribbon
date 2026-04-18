#!/usr/bin/env node

process.on('uncaughtException', (err) => {
    console.log(`program encountered an error: ${err.message}`); 
    process.exit(1); 
});

process.on('unhandledRejection', (err) => {
    console.log('Asynchronous task error:', err);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Aborted By User');
    process.exit(0);
});

import './cmd-hub.ts'

import "./path.ts";