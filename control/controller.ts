import { Command } from 'commander';
import "./manage.ts";
import { cacheManager } from './.usr_utils/timer.ts'
import { spawnAgent } from '../src/api/spawn.ts';

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
		spawnAgent(name as string)
	});

import { branch, deleteKey } from './.usr_utils/key_manage.ts'

program.command('login')
	.description('login/initialize password')
	.action(async () =>
	{
		await branch();
	})

// dev
program.command('logout')
	.description('delete password')
	.action(async () =>
	{
		await deleteKey();
	})

import { spawnChild } from '../src/api/spawn.ts';

program.command('test')
	.description('test')
	.action(async () =>
	{
		spawnChild({
			cmd: {
				cmdString: ['bun', 'run', `\'${process.env.INDEX_FILE}\'`].join(" "),
				safeRun: false
			}
		})
	})

program.parse(process.argv);