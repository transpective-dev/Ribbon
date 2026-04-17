import { Command } from "commander";
import interfaces from "./forms/interface.ts";
import { rib_conf } from "./manage.ts";
import utils from "./utils/utils.ts";
import _path from "./path.ts";

import enquirer from 'enquirer';

const { prompt } = enquirer;

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from "node:url";



const program = new Command();

program
    .name('rib')
    .description('Ribbon')
    .version('0.0.0-beta')
    .usage('<command> [options]')
    .helpOption('-h, --help', 'display help for command')

import type { cmd_register } from "./forms/interface.ts";

const registerCommand = ({
    command,
    alias,
    argument,
    options,
    desc,
    action
}: cmd_register
) => {

    const cmd = program.command(command);

    if (alias) {
        if (Array.isArray(alias)) {
            alias.forEach((a) => cmd.alias(a));
        } else {
            cmd.alias(alias);
        }
    };
    if (argument) argument.forEach((arg) => cmd.argument(arg));
    if (options) options.forEach((option) => cmd.option(option.option, option.desc));
    if (desc) cmd.description(desc);
    if (action) cmd.action(action);

}

await (async () => {

    const commandsDir = path.join(_path.root, 'src', 'logics', 'commands');
    const files = fs.readdirSync(commandsDir);

    for (const file of files) {
        if (file.endsWith('.cmd.ts')) {
            const filePath = pathToFileURL(path.join(commandsDir, file)).href;
            const module = await import(filePath);
            registerCommand(module.default);
        }
    }

})()

program.parse(process.argv);

