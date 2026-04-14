import { spawn } from "node:child_process";
import { rib_conf } from "../manage.ts";
import enquirer from "enquirer";
const { prompt } = enquirer;
import { colored_prefix } from "../utils/color.ts";

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

import _interface from "../forms/interface.ts";

export default {
    command: 'exec',
    alias: 'run',
    argument: '<alia>',
    options: [
        { option: '-t, --type <value...>', desc: 'Type of execution' }
    ],
    desc: 'Execute a command',
    action: async (alia: string, options: any) => {

        const get = rib_conf.get(alia);

        if (!get) {
            console.log(colored_prefix.error + 'command not found');
            return;
        }

        const requiredType = _interface.supported_type;

        const validateType = (value: string, type: string): boolean => {
            if (type === 'string') return true;
            if (type === 'number') return !isNaN(Number(value)) && value.trim() !== '';
            if (type === 'boolean') return ['true', 'false'].includes(value.toLowerCase());
            return false;
        };

        let isValid = true;

        const i = (get.cmd.split(/(<T:?\s?\w*>)/) as string[]).map((item) => {

            item.trim()

            if (item === '') return;

            if (item.match(/<T:\s?\w*>/)) {

                const match = item.match(/<T:\s*(\w*)>/)

                const type = (match ? match[1] : '')?.trim() as typeof requiredType[number];

                if (!requiredType.includes(type)) {
                    console.log(colored_prefix.error + `invalid type ${type}`);
                    isValid = false;
                    return;
                }

                if (validateType(options.type[0], type)) {
                    return options.type.shift().trim();
                } else {
                    console.log(colored_prefix.error + `invalid value for type ${type}`);
                    isValid = false;
                    return;
                }

            }

            if (item === '<T>') {
                return options.type.shift().trim();
            }

            return item.trim();

        }).join(' ')

        if (!isValid) {
            return console.log(colored_prefix.error + 'command execution failed');
        }

        const detected = await rib_conf.filter(i);

        if (detected.detected.length > 0) {

            const config = rib_conf.all('config') as any;

            if (config.settings.showMacro) {
                console.log('\n' + '='.repeat(20) + ' Keywords Detected ' + '='.repeat(20));
                console.log('\ncommand: ' + detected.cmd);
                console.log('\ngroups: ')
                detected.detected.forEach((item: any) => {
                    console.log(`- ${item.group}: ${item.keywords.join(', ')}`);
                })
                console.log('\nmessage: ' + detected.msg + '\n\n' + "=".repeat(59) + '\n\n');
            }

            const isRejected = 'alwaysRejectExecution' in config.settings ? config.settings.alwaysRejectExecution : false;

            let isContinue = {
                type: 'select',
                name: 'isContinue',
                message: 'Are you sure you want to continue?',
                choices: [
                    'yes',
                    'no'
                ]
            }

            if (!isRejected) {

                isContinue = await prompt(isContinue);

            }


            if ('isContinue' in isContinue && isContinue.isContinue === 'no' || isRejected) {
                return console.log('Execution Cancelled by Ribbon-Execution-Guard')
            }

        }

        console.log(i)

        spawnChild(i);

    }
}

