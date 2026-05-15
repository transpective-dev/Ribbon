import { Command } from 'commander';
import  "./manage.ts";

const program = new Command();

program
	.name("hlin")
	.description('select menu for hlin')
	.helpOption('-h, --help', 'display help for command')

program.command('open')
	.description('start application')
	.argument("name", "name of the application")
	.action((name) => {

		if (!name) {
			
		}
	});

import {branch, deleteKey} from './.usr_utils/key_manage.ts'

program.command('login')
.description('login/initialize password')
.action(async () => {
	await branch();
})

program.command('logout')
.description('delete password')
.action(async () => {
	await deleteKey();
})

program.parse(process.argv);