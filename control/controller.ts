import { Command } from 'commander';
import "./manage.ts";
import { cacheManager } from './.usr_utils/timer.ts'
import { spawnAgent } from '../src/logics/utils/spawn.ts';

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

import { branch } from './.usr_utils/key_manage.ts'
import { cleanEverything } from './.usr_utils/encryption_utils.ts';

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
		await cleanEverything();
	})

import { spawnChild } from '../src/logics/utils/spawn.ts';

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