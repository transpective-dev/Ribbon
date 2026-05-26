import { Command } from "commander";
import _path from "./utils/path.ts";

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from "node:url";

const cmd_file_list = new Set<string>([
	path.join(_path.paths.commands, 'config.cmd.ts'),
	path.join(_path.paths.commands, 'del.cmd.ts'),
	path.join(_path.paths.commands, 'exec.cmd.ts'),
	path.join(_path.paths.commands, 'find.cmd.ts'),
	path.join(_path.paths.commands, 'register.cmd.ts'),
]);



const program = new Command();

program
	.name('rib')
	.description('Ribbon')
	.version('0.0.0-beta')
	.usage('<command> [options]')
	.helpOption('-h, --help', 'display help for command')

import type { cmd_register } from "./templates/interface.ts";

const registerCommand = (
	{
		command,
		alias,
		argument,
		options,
		desc,
		action
	}: cmd_register

) =>
{

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

await (async () =>
{

	const commandsDir = _path.paths.commands;

	const files = fs.existsSync(commandsDir) ? fs.readdirSync(commandsDir).map((file: any) =>
	{
		return path.join(commandsDir, file)
	}) : [];

	files.forEach((file: any) =>
	{
		cmd_file_list.add(file)
	})

	for (const file of cmd_file_list) {
		if (file.endsWith('.cmd.ts')) {
			const filePath = pathToFileURL(file).href;
			const module = await import(filePath);
			registerCommand(module.default);
		}
	}

})()

program.parse(process.argv);

