import { Command } from "commander";
import interfaces from "./forms/interface.ts";
import type { t_search_types } from "./forms/interface.ts";
import { rib_conf } from "./manage.ts";
import utils from "./utils/utils.ts";
import { spawn } from "node:child_process";

import enquirer from 'enquirer';
import { keyof, util } from "zod";
const { prompt } = enquirer;

const [command, config] = [rib_conf.all('command'), rib_conf.all('config')];

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

const program = new Command();

program
    .name('rib')
    .description('Ribbon')
    .version('0.0.0-beta')
    .usage('<command> [options]')
    .helpOption('-h, --help', 'display help for command')

program
    .command('register')
    .alias('regis')
    .argument('<i>')
    .option('-d, --desc <value>', 'Description of the command')
    .option('-a, --abstract <value>', 'Abstract of the command')
    .option('-t, --tags <value>', 'Tags of the command')
    .description('register new command')
    .action((i, options) => {

        // split into two parts 
        const [key, value] = i.split(/=(.*)/s);

        if (rib_conf.has(key)) {
            console.log('error: command already exists');
            return;
        }

        if (options?.abstract?.length > 30) {

            console.log('abstract-error: abstract must be less than 30 characters');

            options.abstract = (options.abstract as string).slice(0, 30) + '...';

            console.log(`after trimmed: ${options.abstract}`);

        }

        if (!value) {
            console.log('format-error: please use key="command"');
            return;
        }

        // Strip quotes and trim
        const cleanCmd = value.replace(/^"|"$/g, '').trim();

        const tags = options.tags && (options.tags as string).split(',').map((tag) => tag.trim());

        const content = {
            id: utils.generate_id(),
            time: utils.generate_local_time(),
            abs: options.abstract || 'No abstract provided',
            desc: options.desc || "No description provided",
            cmd: cleanCmd,
            tags: tags || [],
        }

        const res = rib_conf.register(key, content);

        if (res.status) {
            (() => [...utils.log_formatter('Command registered: ', rib_conf.get(key))])();
        } else {
            console.log(`Command registration failed: ${res.msg}`);
        }

    });

program
    .command('del')
    .argument('<name>', 'Name of the command to delete')
    .description('Delete a command')
    .action(async (name) => {

        const ask = 'askBeforeDelete' in config.settings ? config.settings.askBeforeDelete : true;

        if (ask) {

            const ask = {
                type: 'select',
                name: 'ask',
                message: 'Are you sure you want to delete this command?',
                choices: [
                    'yes',
                    'no'
                ]
            };

            (() => [...utils.log_formatter('Command to delete: ', rib_conf.get(name))])();

            const res = await prompt(ask)

            if ('ask' in res && res.ask === 'no') {
                return console.log('Deletion cancelled')
            }

        }

        const res = rib_conf.delete(name);

        if (res.status) {
            console.log(`Command deleted successfully: ${name}`);
        } else {
            console.log(`Command deletion failed: ${res.msg}`);
        }

    });

program
    .command('exec')
    .alias('run')
    .argument('<alia>', 'alia of the command to execute')
    .option('-t, --type <value...>', 'Type of execution')
    .description('Execute a command')
    .action(async (alia, options) => {

        const get = rib_conf.get(alia);

        if (!get) {
            console.log('error: command not found');
            return;
        }

        const i = (get.cmd.split('<T>') as string[]).map((item) => item.trim()).reduce((acc, cur, index) => {

            if (index === 0) {
                return acc + cur;
            }

            return acc + ' ' + options.type[index - 1] + ' ' + cur;

        }, '');

        const detected = await rib_conf.filter(i);

        if (detected.detected.length > 0) {

            console.log('\n' + '='.repeat(20) + ' Keywords Detected ' + '='.repeat(20));
            console.log('\ncommand: ' + detected.cmd);
            console.log('\ngroups: ')
            detected.detected.forEach((item) => {
                console.log(`- ${item.group}: ${item.keywords.join(', ')}`);
            })
            console.log('\nmessage: ' + detected.msg + '\n\n' + "=".repeat(59) + '\n\n');

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

    });

program
    .command('src')
    .description('search for commands')
    .option('-t, --type <value>', 'Type of search')
    .option('-v --value <value>', 'Value of search')
    .option('-m --minified', 'Show minified version')
    .action((options) => {

        if (!interfaces.search_types.includes(options.type)) {
            console.log("Invalid search type. We'll use 'all' as default");
            options.type = 'all';
        }

        const res = rib_conf.src(options.type, options.value, options.minified);

        if (options.minified) {
            
            if ((res as string[]).length <= 0) return console.log('No macros found');
            
            if (Array.isArray(res)) {
                return utils.list_up(res as string[]);
            }

        }

        if ((Object.keys(res)).length <= 0) {
            return console.log('No macros found');
        }


        console.log(res)

    });

program
    .command('ls')
    .option('-f --full', 'see original')
    .description('List up commands')
    .action((options) => {

        if (options.full) {
            return console.log(rib_conf.ls({ isFull: true }));
        }

        const { header } = utils;

        utils.list_up(rib_conf.ls({ headerLength: header }) as string[]);

    });

program.parse(process.argv);