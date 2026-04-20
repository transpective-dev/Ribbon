// for creating something. like schema and temp

import enquirer from 'enquirer'
const { prompt } = enquirer
import _path from "../src/logics/path.ts";
import path from 'path'
import { colored_prefix } from "../src/logics/utils/color.ts";
import fs from 'fs-extra'

const device = process.platform === 'win32' ? 'win' : 'linux'


const init_script = async (name: string) => {

    const {
        scripts
    } = _path.paths

    const toTarget = path.join(scripts, name + '.script.ts')

    const template = `

// Showcase 

// import api from this relative path.
// you can change the name as you want.
import rib_api from '../../api/api-hub.ts'

// in this showcase, we use spawn.
// spawn_api is makes you able to spawn a process and run commands.
// if you are js programmer, you can import spawn from child_process. 
// and do more fancy things.

const { spawn } = rib_api

// how to use spawn ?

/* there is several method we provided.
1. get: you can get instance and call inside functions
2. dispose: when you don't need this instance anymore, you can dispose it to avoid memory leaks.
3. onStdout/onStderr: you can listen strout and stderr dynamically. 
4. when: if you are not good at js-coding, you can use this mothod to take some easy actions. we will demonstrate it later.
5. run: you can run command here.
6. log: every log we've catched. you can do more complex task with this.
*/

// example

// first, we are going to destructure the spawn
// although we can call it like a method, but destructuring is more clean visually.

const spawn_a = spawn() 

const { get, dispose, onStdout, onStderr, run } = spawn_a

// create your command set

const commandSet = [
'echo hello world',
${device === 'win' ? '\'Write-Error "Something went wrong"\'' : 'echo "Error message" >&2'},
'sleep 3',
'echo after sleep'
]

// start running command set

for (const i in commandSet) {

    const cmd = commandSet[i]!

    console.log('hello from index ', i)

    let exit: boolean = false

    // Run your command and watch specific logs elegantly
    await run(cmd, {
        stdout: [
            { includes: 'hello', action: () => console.log('Got hello') }
        ],
        stderr: [
            { includes: 'error', action: (data, stop) => {
                console.log('Got error')
                exit = true
                stop() // immediately abort the running process
            }}
        ]
    });

    if (exit) {
        console.log('you wont see "after sleep"')
        break
    }

}

dispose()

// you also can write a function and run commands inside
const template = () => {
    // command to run
}

// you can IFE it self or call at here
(() => {
    template()
})()

    `

    try {

        await fs.ensureFile(toTarget)

        const isExist = await fs.pathExists(toTarget)

        if (isExist) {

            const recover = await prompt({
                type: 'select',
                name: 'recover',
                message: 'Script already exists. Recover it?',
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false }
                ]
            });

            if ('recover' in recover) {

                if (recover.recover === 'No') {
                    return {
                        status: false,
                        message: 'Script already exists'
                    }
                }

            }
        }

        await fs.writeFile(toTarget, template)

        return {
            status: true,
            message: toTarget
        };

    } catch (error) {

        return {
            status: false,
            message: error
        }

    }


}

export default {
    command: 'create',
    desc: 'create something',
    argument: [
        '<type>'
    ],
    action: async (type: any, options: any) => {

        switch (type) {
            case "script": {

                const askForName = async () => {

                    const res = await prompt({
                        type: 'input',
                        name: 'name',
                        message: 'Enter script name',
                    });

                    if ('name' in res) {

                        const val = (res.name as string).trim();

                        if (!val) {

                            console.log('\nName is required\n');

                            return await askForName();

                        }

                        return val;
                    }

                };

                const scriptName = await askForName();

                if (scriptName) {

                    const res = await init_script(scriptName);

                    if (!res.status) {
                        console.log(colored_prefix.error + res.message);
                        return;
                    }

                    console.log('Script created at: ' + res.message);

                }

                break;
            }
        }


    }
}