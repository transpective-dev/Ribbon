// for creating something. like schema and temp

import _path from "../src/logics/path.ts";
import path from 'path'
import { colored_prefix } from "../src/logics/utils/color.ts";
import type { cmd_register } from '../src/logics/templates/interface.ts';
import command_temp from '../src/logics/templates/create_temps/cmd_temp.ts'
import enquirer from 'enquirer';
const { prompt } = enquirer;
import fs from 'fs-extra';

const platform = process.platform === 'win32' ? 'win' : 'linux'

const _init = async ({
    name, showcase, type
}: {
    name: string,
    showcase: boolean,
    type: 'cmd'
}) => {

    const targetFolder = _path.paths.custom

    const toTarget = path.join(targetFolder, name + `.${type}.ts`)

    const template: string = (() => {

        switch (type) {
            case 'cmd': {
                return showcase ? command_temp.showcase() : command_temp.template
            }
        }

    })()

    try {

        const isExist = await fs.pathExists(toTarget)

        if (isExist) {

            const recover = await prompt({
                type: 'select',
                name: 'recover',
                message: `${type} already exists. Recover it? \n\n ${toTarget}`,
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

        await fs.ensureFile(toTarget)

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

    } finally {

        console.log('\n')

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
        },
        {
            option: '-n, --name <value>',
            desc: 'name for file'
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