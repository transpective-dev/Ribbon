import { rib_conf } from "../src/logics/manage.ts";
import _interface from "../src/logics/forms/interface.ts";
import enquirer from "enquirer";
const { prompt } = enquirer;
import { colored_prefix } from "../src/logics/utils/color.ts";
import utils from "../src/logics/utils/utils.ts";
import { execution_guard } from "../src/logics/utils/executions/execution_guard.ts";
import { type_checker } from "../src/logics/utils/executions/type_checker.ts";
import { spawn } from "child_process";
import _path from "../src/logics/path.ts"
import fs from 'fs-extra'
import path from 'path'

import type { cmd_register } from "../src/logics/forms/interface.ts";

const spawnChild = (cmd: string) => {

    return new Promise((resolve, reject) => {

        const kill = (status: boolean) => {
            child.kill();
            status ? resolve(true) : reject(false)
        }

        const child = spawn(cmd, {
            shell: true,
            stdio: 'inherit',
        });

        child.on('exit', (code) => {
            code === 0 ? kill(true) : kill(false)
        });

        child.on('error', (err) => {
            kill(false)
        });

    })
}

const runScript = async (filename: string) => {
    
    const files = (await fs.readdir(_path.paths.scripts)).filter((file) => file.endsWith('.script.ts'))
    
    if (!files.includes(filename + '.script.ts')) {
        return false
    }

    const toTarget = path.join(_path.paths.scripts, filename + '.script.ts')

    console.log(toTarget)

    return await spawnChild('npx bun ' + JSON.stringify(toTarget))

}

export default {
    command: 'exec',
    alias: ['run', 'r'],
    argument: [
        '<value>',
        '[type...]',
    ],
    options: [
        {
            option: '-d, --direct',
            desc: 'Direct command execution (bypass alias)'
        },
        {
            option: '-s, --script',
            desc: 'Execute a script'
        },
    ],
    desc: 'Execute a command',
    action: async (value: string, type: any, options: any) => {

        if (options.script) {
            const res = await runScript(value);

            if (!res) {
                console.log(colored_prefix.error + 'script not found');
            }

            return console.log(colored_prefix.success + 'script executed successfully');
        }

        if (options.direct) {

            const cmd = value;

            const isSafe = await execution_guard(cmd);

            if (!isSafe) {
                return;
            }

            spawnChild(cmd);

            return;
        }

        const {
            group,
            key
        } = utils.getGroupAndKey(value);

        const get_cmd = async (key: string = '', group?: string) => {

            const form: {
                key: string,
                group?: string
            } = { key }

            group && (form.group = group)

            console.log('[group]: ', group)
            console.log('[ key ]: ', key)

            const res = rib_conf.get(form)

            if (res === null || res === undefined) {

                const get_select = await prompt({
                    type: 'select',
                    name: 'get',
                    message: 'Command not found',
                    choices: [
                        { name: 'global', message: 'try global search' },
                        { name: 'new', message: 'try new' },
                        { name: 'exit', message: 'exit' }
                    ]
                })

                if ('get' in get_select) {

                    if (get_select.get === 'global') {
                        return await get_cmd(key)
                    }

                    if (get_select.get === 'new') {

                        const get_input = await prompt({
                            type: 'input',
                            name: 'get',
                            message: 'Enter group and alias',
                        })

                        if ('get' in get_input) {
                            const { group, key } = utils.getGroupAndKey(get_input.get as string);
                            return await get_cmd(key, group);
                        }
                    }

                    if (get_select.get === 'exit') {
                        return;
                    }

                }
            }

            utils.log_formatter('Command found: ', res)

            return res;

        };

        const get = await get_cmd(key, group);

        if (!get) {
            console.log(colored_prefix.error + 'command not found');
            return;
        }

        const i = await type_checker(get.cmd, type);

        if (!i) {
            return console.log(colored_prefix.error + 'command execution failed');
        }

        const isSafe = await execution_guard(i);

        if (!isSafe) {
            return;
        }

        spawnChild(i);

    }

} satisfies cmd_register;


