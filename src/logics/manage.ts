import Conf from 'conf'
import _schema from './forms/schema.ts'
import type { t_command_schema, t_config_schema } from './forms/schema.ts';
import schemas from './forms/schema.ts'
import path from './path.ts';
import _init from './utils/config_init.ts';
import chalk from 'chalk';
import { pallete } from './utils/color.ts';
import utils from './utils/utils.ts';

const platform = process.platform;

class RibbonConfig {

    private config: {
        command: Conf<t_command_schema>
        config: Conf<t_config_schema>
    };

    constructor() {

        this.config = {

            command: new Conf<t_command_schema>({
                configName: 'registered',
                cwd: path.usr
            }),

            config: new Conf<t_config_schema>({
                configName: 'config',
                cwd: path.usr
            })

        };

        const config = this.config.config

        _init.initConditional(config, 'filter', () => {
            if (platform === 'win32') return _init.windows;
            if (platform === 'darwin') return _init.darwin;
            return _init.linux;
        });

        const defaultSettings = schemas.config_schema.parse({}).settings;
        _init.initBatch(config, { settings: defaultSettings });

    }

    // src command
    src(type: string, keywords?: string, isMinified?: boolean) {

        const entried = Object.entries(this.all('command'))

        let res: t_command_schema = {}

        if (type === 'all') {

            res = Object.fromEntries(
                entried.filter(([key, value]) => {

                    if (keywords) {
                        return value[key].includes(keywords)
                    }

                    return true

                })
            )

        }

        res = Object.fromEntries(
            entried.filter(([_, value]) => {

                // filter by keywords if provided
                if (keywords) {
                    return value[type].includes(keywords)
                }

                // otherwise return everything
                return true;
            })
        );

        if (isMinified) {
            
            return this.ls({provided: res})

        }

        return res

    }

    // register command
    register(key: string, value: t_command_schema[string]) {

        try {
            this.config.command.set(key, value)
            return { status: true, msg: 'Command registered successfully' }
        } catch (err) {
            return { status: false, msg: 'Command registration failed' }
        }

    }

    // delete command
    delete(key: string) {

        try {
            this.config.command.delete(key)
            return { status: true, msg: 'Command deleted successfully' }
        } catch (err) {
            return { status: false, msg: 'Command deletion failed' }
        }

    }

    // show command list
    ls({
        headerLength,
        isFull,
        provided
    }: {
        headerLength?: {
            [key: string]: string
        },
        isFull?: boolean,
        provided?: t_command_schema
    }
    ): (string[] | t_command_schema) {

        
        if (provided) {
            headerLength = utils.header
        }
        
        if (isFull) {
            return this.src('all') as t_command_schema
        }

        const arr: string[] = []

        const {
            id,
            alia,
            t,
            abs,
            time
        } = headerLength || {};

        Object.entries( provided || this.all('command')).forEach(([key, value]) => {

            const field: string[] = [
                `${value.id}`.padEnd(id?.length || 0),
                `${key}`.padEnd(alia?.length || 0),
                `${value.cmd.split('<T>').length - 1}`.padEnd(t?.length || 0),
                `${value.abs}`.padEnd(abs?.length || 0),
                `${value.time}`.padEnd(time?.length || 0),
            ]

            arr.push(`${field.join(chalk.hex(pallete.gray)(' | '))}`);

        })

        return arr

    }

    all(type: 'command' | 'config') {
        return this.config[type].store;
    }

    get(key: string) {
        return this.config.command.get(key);
    }

    has(key: string) {
        return this.config.command.has(key);
    }

    async filter(cmd: string): Promise<{

        cmd: string,

        detected: {
            group: string,
            keywords: string[]
        }[],

        msg: string | null

    }> {

        const config = this.all('config');

        const filters = config.filter as t_config_schema['filter'];

        const detected: { group: string; keywords: string[] }[] = [];

        for (const [groupName, rule] of Object.entries(filters)) {

            const matchedKeywords = rule.keywords.filter((keyword: string) =>

                cmd.includes(keyword)

            );

            if (matchedKeywords.length > 0) {

                detected.push({
                    group: groupName,
                    keywords: matchedKeywords
                });

            }
        }

        let msg: string | null;

        if (detected.length === 0) {

            msg = null;

        } else if (detected.length === 1) {

            const singleGroup = detected[0]?.group;

            if (singleGroup === undefined) {

                msg = `WARNING: We have detected [ ${singleGroup} ]`;

            } else {

                msg = filters[singleGroup]?.msg || `WARNING: We have detected [ ${singleGroup} ]`;

            }

        } else {

            const groupNames = detected.map(d => d.group).join(', ');

            msg = `DANGER: We have detected [ ${groupNames} ]`;

        }

        const highlighted = highlightKeywords(cmd, detected.flatMap(d => d.keywords));

        return {
            cmd: highlighted,
            detected,
            msg
        };
    }

}

export const rib_conf = new RibbonConfig();

export const highlightKeywords = (cmd: string, keywords: string[]) => {

    let highlighted = cmd;

    keywords.forEach(kw => {

        // find keywords globally and color up
        const regex = new RegExp(`(${kw})`, 'g');

        highlighted = highlighted.replace(regex, chalk.red.bold('$1'));

    });

    return highlighted;
};