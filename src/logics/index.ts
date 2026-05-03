// paths
import "./path.ts";

import al from "../async_loader.ts";
export { al };

process.on('uncaughtException', (err) => {
    console.log(`program encountered an error: ${err.message}`); 
    process.exit(1); 
});

process.on('unhandledRejection', (err) => {
    console.log('Asynchronous task error:', err);
    process.exit(1);
});

// user's platform etc
import './env.ts'

// cmd-load logic
import './cmd-hub.ts'

import './manage.ts'
