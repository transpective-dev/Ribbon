const { rib_conf } = globalThis._rib_manage
const { type_checker } = globalThis._rib_tk
const { spawnChild } = globalThis._rib_spawn
const { _path } = globalThis._rib_path
const { colored_prefix } = globalThis._rib_color
const utils = globalThis._rib_utils
const { cmd_register } = globalThis._rib_types
const fs = globalThis._rib_mod_fs_extra
import type { t_command_schema } from '../src/logics/templates/schema.ts'

import enquirer from 'enquirer'
const { prompt } = enquirer

import path from 'path';

const runScript = async (filename: string) =>
{

	const files = (await fs.readdir(_path.paths.scripts)).filter((file: string) => file.endsWith('.script.ts'))

	if (!files.includes(filename + '.script.ts')) {
		return false
	}

	const toTarget = path.join(_path.paths.scripts, filename + '.script.ts')

	const cmd = process.env.RIB_RUNTIME === 'bun' ?
		`bun "${toTarget}"` :
		`npx tsx "${toTarget}"`;

	return await spawnChild({
		cmd
	})

}

export default {
	command: 'exec',
	alias: ['run', 'r'],
	argument: [
		'<args...>',
	],
	options: [
		{
			option: '-s, --script',
			desc: 'Execute a script'
		},
		{
			option: '-d, --direct',
			desc: 'Execute a command directly'
		},
	],
	desc: 'Execute a command',
	action: async (args: any, options: any) =>
	{

		if (options.script) {

			const res = await runScript(args[0] as string);

			if (!res) {
				return console.log(colored_prefix.error + 'script not found');
			}

			return console.log(colored_prefix.success + 'script executed successfully');
		}

		if (options.direct) {

			const cmd = args.join(' ');

			spawnChild({
				cmd: {
					cmdString: cmd,
					isMacro: false
				}
			});

			return;
		}

		const get_cmd = async (key: string = args[0] as string) =>
		{

			console.log('[ key ]: ', key, '\n')

			const res = rib_conf.get(key)

			if (res === null || res === undefined) {

				return null;
			}

			utils.log_formatter('Found Macro: ', res)

			return res;

		};

		const get: t_command_schema[string] = await get_cmd();

		if (!get) {
			console.log(colored_prefix.error + 'command not found');
			return;
		}

		let replaced_cmd = await type_checker(get.cmd, args);

		if (!replaced_cmd) {
			return console.log(colored_prefix.error + 'command execution failed');
		}

		spawnChild({
			cmd: {
				cmdString: replaced_cmd,
				safeRun: get.safeRun || false,
			}
		});

	}

} satisfies typeof cmd_register;