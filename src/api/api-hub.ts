import { Spawn } from "./spawn.ts";

/* Direct assignment creates a stale reference, 
so I used a getter for live access and a cleaner syntax without parentheses. */

export const spawn = (showInConsole: boolean = true) => {

    let instance: Spawn | null = new Spawn(showInConsole);

    let log: string = '';

    // Bind log listeners ONCE
    instance.emit.on('stdout', (data) => { log += data; });
    instance.emit.on('stderr', (data) => { log += data; });

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
        },

        // keep listening stderr (pass callback)
        onStderr: (callback: (data: string) => void) => {
            instance?.emit.on('stderr', callback);
        },

        // run command with optional watch conditions
        run: async (cmd: string, watch?: {
            stdout?: { includes?: string, action: (data: string, stop: () => void) => void }[],
            stderr?: { includes?: string, action: (data: string, stop: () => void) => void }[]
        }) => {

            const stopFunc = () => instance?.kill();

            // create binding wrappers
            const outBinders = watch?.stdout?.map(opt => {
                return (data: string) => {
                    if (!opt.includes || data.includes(opt.includes)) opt.action(data, stopFunc);
                };
            }) || [];

            const errBinders = watch?.stderr?.map(opt => {
                return (data: string) => {
                    if (!opt.includes || data.includes(opt.includes)) opt.action(data, stopFunc);
                };
            }) || [];

            // mount listeners
            outBinders.forEach(b => instance?.emit.on('stdout', b));
            errBinders.forEach(b => instance?.emit.on('stderr', b));

            try {

                return await instance?.spawn(cmd);
                
            } catch(e: any) {
              
                console.error(e)

                return 1

            }
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