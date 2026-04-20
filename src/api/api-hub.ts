import { Spawn } from "./spawn.ts";

interface exec {
    type: 'stdout' | 'stderr',
    satisfied: {
        includes?: string | RegExp,
        notIncludes?: string | RegExp,
        func?: (data: string) => boolean
    }
    action: (data: string, stop: () => void) => void
}

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

        run: async (cmd: string, watch?: exec[]) => {

            const stopFunc = () => instance?.kill();

            const binders: { type: 'stdout' | 'stderr', func: any }[] = [];
            watch?.forEach(w => {
                
                // inject intercepted data
                const wrapper = (data: string) => {
                    const opt = w.satisfied || {};

                    // filter

                    // 1. if includes has value but not matched
                    if (opt.includes) {

                        if (typeof opt.includes === 'string') {

                            // if no content matched
                            if (!data.includes(opt.includes)) return;

                        } else {

                            // if no regex matched
                            if (!new RegExp(opt.includes).test(data)) return;

                        }
                    }
                    
                    // 2. if notIncludes has value but matched
                    if (opt.notIncludes && data.includes(opt.notIncludes.toString())) return;

                    // 3. if func has value and returned false
                    if (opt.func && !opt.func(data)) return;

                    w.action(
                        data,
                        stopFunc,
                    );
                };

                binders.push({ type: w.type, func: wrapper });
                
                instance?.emit.on(w.type, wrapper);

            });

            try {

                return await instance?.spawn(cmd);

            } catch (e: any) {

                process.stderr.write(e);
                return 1;

            } finally {
                // guaranteed cleanup of all active listeners
                binders.forEach(b => instance?.emit.off(b.type, b.func));
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