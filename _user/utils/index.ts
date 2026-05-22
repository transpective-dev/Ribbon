import { Command } from "commander";
import { branch } from "./handle_login.ts";
import fs from 'fs-extra'

const program = new Command();

program
	.command('login')
	.action(async () =>
	{
		try {

			const output = process.env.OUTPUT_FILE!;

			const res = await branch();
			fs.writeFileSync(output, res.toString());
			
		} catch (err) {
			console.error('\nLogin cancelled or an error occurred.', err);
			process.exit(1);
		}
	});

program.parse(process.argv);