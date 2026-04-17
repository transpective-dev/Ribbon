import { spawn } from "node:child_process";
import { rib_conf } from "../manage.ts";
import enquirer from "enquirer";
const { prompt } = enquirer;
import { colored_prefix } from "../utils/color.ts";
import utils from "../utils/utils.ts";

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
    alias: ['run', 'x'],
    argument: [
        '<alia>',
        '<type...>',
    ],
    desc: 'Execute a command',
    action: async (alia: string, type: any) => {

        const {
            group,
            key
        } = utils.getGroupAndKey(alia);

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

        // Validate type; abort if no match found.
        let isValid = true;

        // aggregate command here
        let i_cmd = '';

        // split command for type mapping
        const parts = get.cmd.split(/(<T:?\s?\w*>)/) as string[];

        const isAsk = (() => {

            const i = rib_conf.all('config').settings.asking;

            const to: {
                typeMissing?: boolean,
                typeNotMatched?: boolean
            } = {
            }

            if ('whenTypeMissing' in i) {
                to.typeMissing = true;
            }

            if ('whenTypeNotMatched' in i) {
                to.typeNotMatched = true;
            }

            return to;
        })();

        const requiredType = _interface.supported_type;

        const validateType = async (value: string, type: string): Promise<string | false> => {

            let valType: typeof requiredType[number] | 'unknown' = 'unknown';

            if (['true', 'false'].includes(value.toLowerCase())) {
                valType = 'boolean';
            } else if (!isNaN(Number(value)) && value.trim() !== '') {
                valType = 'number';
            } else {
                valType = 'string';
            }

            // string can broadly accept numbers/booleans as text, but based on strict typing for others
            if (valType === type || type === 'string') {
                return value;
            }

            if (isAsk.typeNotMatched) {

                const res = await prompt({
                    type: 'select',
                    name: 'action',
                    message: `Type mismatch! Expected [${type}] but got [${valType}] ('${value}')`,
                    choices: [
                        { name: 'modify', message: 'Modify' },
                        { name: 'ignore', message: 'Ignore' },
                    ]
                });

                if ('action' in res) {
                    if ((res as any)['action'] === 'ignore') {
                        return false;
                    }

                    if ((res as any)['action'] === 'modify') {
                        const newInput = await prompt({
                            type: 'input',
                            name: 'new_val',
                            message: `Enter new ${type} value:`
                        });

                        if ('new_val' in newInput) {
                            // Recursively call for the newly provided value
                            return await validateType((newInput as any)['new_val'], type);
                        }
                    }
                }

                return false;
            }

            return false;
        };

        for (let item of parts) {

            // handle type missing 
            const askForType = async () => {
                const res = await prompt({
                    type: 'input',
                    name: 'missing type',
                    message: `missing parameter for ${item}, please input: `
                });

                if ('missing type' in res) {
                    return (res as any)['missing type'];
                }
                return '';
            }

            // check type existence
            const checkExistence = async () => {
                if (type === undefined || type.length === 0) {
                    return await askForType();
                }
                return type.shift()?.trim();
            }

            item = item.trim();

            if (item === '') continue;

            if (item.match(/<T:\s?\w*>/)) {

                const match = item.match(/<T:\s*(\w*)>/);

                const type = (match ? match[1] : '')?.trim() as typeof requiredType[number];

                const val = await checkExistence();

                if (!requiredType.includes(type)) {

                    console.log(colored_prefix.error + `invalid type ${type}`);

                    isValid = false;

                    break;

                }

                const finalVal = await validateType(val, type);

                if (finalVal !== false) {

                    const configData = rib_conf.all('config').settings as any;

                    if ("appendDQWhenTString" in configData && configData.appendDQWhenTString && type === 'string') {
                        i_cmd += ' ' + JSON.stringify(finalVal);
                    } else {
                        i_cmd += ' ' + finalVal;
                    }

                } else {
                    console.log(colored_prefix.error + `invalid value for type ${type}`);
                    isValid = false;
                    break;
                }

                continue;
            }

            if (item === '<T>') {
                const val = await checkExistence();
                i_cmd += ' ' + val;
                continue;
            }

            // Normal command chunk
            i_cmd += (i_cmd.length > 0 ? ' ' : '') + item;

        }

        const i = i_cmd.trim();

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

        spawnChild(i);

    }
}

