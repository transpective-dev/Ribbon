import { Command } from 'commander';
import "./cache.util.ts";
import { spawnInput } from './utils/spawner.ts';
import { getLoginState } from './cache.util.ts';
import { spawnSync } from 'node:child_process';

const program = new Command();

program
	.name("hlin")
	.description('select menu for hlin')
	.helpOption('-h, --help', 'display help for command')

program.command('open')
	.description('start application')
	.argument("name", "name of the application")
	.action((name) =>
	{

		const interceptor = process.env.EXE_EXE as string;

		const newEnv = {
			...process.env,
			SHELL: interceptor,
			COMSPEC: interceptor,
		}

		spawnSync(name, [], {
			env: newEnv,
			stdio: 'inherit',
		})
	});


program.command('login')
	.description('login/initialize password')
	.action(async () =>
	{
		await spawnInput({ action: 'login' });

		if (getLoginState() === 'true') {
			return console.log("Login successful")
		}

		return console.log("Login failed")

	})

import { editType } from './_user.interface.ts';

program.command('edit')
	.description('edit config, macro')
	.argument('<type>', 'type of the file to edit')
	.action(async (type) =>
	{
		if (!editType.includes(type as string)) {
			return console.log("Invalid type")
		}

		await spawnInput({ action: "edit", type });
	})

program.parse(process.argv);