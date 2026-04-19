// for creating something. like schema and temp

import enquirer from 'enquirer'
const { prompt } = enquirer
import _path from "../src/logics/path.ts";
import path from 'path'
import { colored_prefix } from "../src/logics/utils/color.ts";
import fs from 'fs-extra'

const init_script = async (name: string) => {

    const {
        scripts
    } = _path.paths

    const toTarget = path.join(scripts, name + '.script.ts')

    const template = `
import rib_api from '../../api/api-hub.ts'

// how to use api

// const { api you want to use } = rib_api
// example: const { spawn } = rib_api

const template = () => {
// command to run
}

// run script here or outside
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