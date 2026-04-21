// for creating something. like schema and temp

import enquirer from 'enquirer'
const { prompt } = enquirer
import _path from "../src/logics/path.ts";
import path from 'path'
import { colored_prefix } from "../src/logics/utils/color.ts";
import fs from 'fs-extra'
import type { cmd_register } from '../src/logics/forms/interface.ts';
import script_temp from './create_temps/script.ts'

const platform = process.platform === 'win32' ? 'win' : 'linux'

const _init = async ({
    name, showcase, type
}: {
    name: string,
    showcase: boolean,
    type: 'script' | 'cmd'
}) => {

    const targetFolder = type === 'script' ? _path.paths.scripts : _path.paths.custom

    const toTarget = path.join(targetFolder, name + `.${type}.ts`)

    const template: string = (() => {

        switch (type) {
            case 'script': {
                return showcase ? script_temp.showcase(platform) : script_temp.template
            }
            case 'cmd': {
                return script_temp.template
            }
        }

    })()

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
    desc: 'create template for script and new command file',
    argument: [
        '<type>'
    ],
    options: [
        {
            option: '-s, --showcase',
            desc: 'create template with showcase'
        }
    ],
    action: async (type: any, options: any) => {

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

        switch (type) {

            case "script": {

                const scriptName = await askForName();

                if (scriptName) {

                    const res = await _init({
                        name: scriptName,
                        showcase: options.showcase,
                        type: 'script'
                    });

                    if (!res.status) {
                        console.log(colored_prefix.error + res.message);
                        return;
                    }

                    console.log('Script created at: ' + res.message);

                }

                break;
            }

            case 'command': {

                const commandName = await askForName();

                if (commandName) {

                    const res = await _init({
                        name: commandName,
                        showcase: options.showcase,
                        type: 'cmd'
                    });

                    if (!res.status) {
                        console.log(colored_prefix.error + res.message);
                        return;
                    }

                    console.log('Command created at: ' + res.message);

                }

                break;
            }

            default: {
                console.log(colored_prefix.error + 'Invalid type');
                break;
            }
        }


    }
} satisfies cmd_register;