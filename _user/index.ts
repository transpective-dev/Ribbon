import { Command } from 'commander';
import "./manage.ts";
import { spawnAgent } from '../src/logics/utils/spawn.ts';
import { spawnInput } from './utils/spawner.ts';
import { cacheManager } from './expiry.ts';

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

import { cleanEverything } from './keys.ts';

program.command('login')
	.description('login/initialize password')
	.action(async () =>
	{
		await spawnInput({ action: 'login' });
	})

program.command('edit')
	.description('edit config, macro')
	.action(async () =>
	{
		// await edit();
	})

// dev
program.command('logout')
	.description('delete password')
	.action(async () =>
	{
		// await cleanEverything();
	})

program.command('test')
	.description('test')
	.action(async () =>
	{
	})

program.parse(process.argv);