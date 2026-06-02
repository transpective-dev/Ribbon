import { Command } from "commander";
import _path from "./utils/path.ts";

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from "node:url"

const program = new Command();

program
	.name('rib')
	.description('Ribbon')
	.version('0.0.0-beta')
	.usage('<command> [options]')
	.helpOption('-h, --help', 'display help for command')

import type { cmd_register, module_cmd_register } from "./templates/interface.ts";

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

	type CommandLoader = () => Promise<module_cmd_register>;

	const native: CommandLoader[] = [
		async () => await import('../../misc/commands/find.cmd.ts'),
		async () => await import('../../misc/commands/config.cmd.ts'),
		async () => await import('../../misc/commands/register.cmd.ts'),
		async () => await import('../../misc/commands/del.cmd.ts'),
		async () => await import('../../misc/commands/exec.cmd.ts'),
	]

	const external = fs.existsSync(commandsDir) ? fs.readdirSync(commandsDir).map((file: any) =>
	{
		return path.join(commandsDir, file)
	}).filter((file: any) =>
	{
		return file.endsWith('.cmd.ts')

	}).map((i) => async () => await import(pathToFileURL(i).href)) : []; // handle if path include space

	const registry: CommandLoader[] = [...native, ...external];

	for (const loader of registry) {

		const commands_list = program.commands.map((cmd) => cmd.name());

		const loaded = await loader()

		if (commands_list.includes(loaded.default.command)) {
			continue;
		}

		registerCommand(loaded.default);

	}

})()

program.parse(process.argv);

