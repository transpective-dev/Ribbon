import { Spawn } from "./spawn.ts";

/* Direct assignment creates a stale reference, 
so I used a getter for live access and a cleaner syntax without parentheses. */

export const spawn = (showInConsole: boolean = true) => {

    let instance: Spawn | null = new Spawn(showInConsole);

    let log: string = '';

    return {
        
        // get instance
        get get() { return instance },

        // dispose instance
        dispose: () => {
            instance?.kill()
            instance = null
        },

        get log() {
            return log
        },

        // keep listening stdout (pass callback)
        onStdout: (callback: (data: string) => void) => {
            instance?.emit.on('stdout', callback);
            instance?.emit.on('stdout', (data) => {
                log += data;
            });
        },
        
        // keep listening stderr (pass callback)
        onStderr: (callback: (data: string) => void) => {
            instance?.emit.on('stderr', callback);
            instance?.emit.on('stderr', (data) => {
                log += data;
            });
        },

        // run command
        run: (cmd: string ) => {
            return instance?.spawn(cmd)
        },

        // conditional trigger
        when: (type: 'stdout' | 'stderr', options: {
            
            // if includes certain string
            includes?: string,
            
            // action to take
            action: (data: string) => void

        }) => {
            instance?.emit.on(type, (data: string) => {
                if (options.includes) {
                    if (data.includes(options.includes)) {
                        options.action(data);
                    }
                } else {
                    options.action(data);
                }
            });
        }
    }
}

import { execution_guard } from "../logics/utils/executions/execution_guard.ts";
import path from "../logics/path.ts";

export default {
    spawn,
    execution_guard,
    path
}