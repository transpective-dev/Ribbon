import type { cmd_register } from "../src/logics/templates/interface.ts";
const { rib_conf } = globalThis._rib_manage;
import chalk from 'chalk'
import enquirer from 'enquirer'
const { prompt } = enquirer;

import type { t_config_schema } from "../src/logics/templates/schema.ts";

import { pallete } from "../src/logics/utils/color.ts";

export default {
    command: 'config',
    desc: 'Ribbon Configuration',
    options: [
        { option: '-l, --list', desc: 'List all configurations and select to toggle' },
        { option: '-t, --toggle <key>', desc: 'Toggle a configuration' }
    ],
    action: async (options: any) => {

        const settings = rib_conf.all('config', true).settings

        if (options.toggle) {

            if (options.toggle in settings) {

                rib_conf.toggle(options.toggle)

            } else {

                return console.log('no key found in config')

            }

        }

        if (options.list) {

            const changeColor = (val: any, isKey: boolean = false) => {
                if (isKey) return chalk.hex(pallete.grey_1)(val);

                if (typeof val === 'boolean') {
                    return val
                        ? chalk.hex(pallete.green_alt)('true')
                        : chalk.hex(pallete.red)('false');
                }

                if (typeof val === 'object') {
                    return chalk.hex(pallete.orange)('{...}');
                }

                return chalk.hex(pallete.teal)(String(val));
            }

            const choices: {
                name: string,
                message: string,
                value: string
            }[] = []

            Object.entries(settings).forEach(([key, value]) => {

                const push = (k: string, v: string) => {
                    choices.push({
                        name: k,
                        message: `${changeColor(k, true)}: ${changeColor(v)}`,
                        value: v
                    })
                }

                if (typeof value === 'object' && value) {


                    return Object.entries(value).forEach(([k, v]) => {
                        push(k, v as string)
                    })

                }

                push(key, value as string)

            })

            console.log('\n')

            const select = await prompt({
                type: 'select',
                name: 'key',
                message: 'Select a configuration to toggle',
                choices
            })

            if (select && typeof select === 'object' && 'key' in select && select.key) {
                rib_conf.toggle(select.key as keyof t_config_schema['settings'])
            }

        }


    }
} satisfies cmd_register;