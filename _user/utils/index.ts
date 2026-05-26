import { Command } from "commander";
import { branch } from "./handle_login.ts";
import fs from 'fs-extra'
import { cipher } from '../cache.util.ts'

const program = new Command();

program
	.command('login')
	.action(async () =>
	{
		try {

			const output = process.env.OUTPUT_FILE!;

			const res = await branch();

			// write state into file for later validation.
			fs.writeFileSync(output, res.toString());

			process.exit(0);

		} catch (err) {

			console.error('\nLogin cancelled or an error occurred.', err);

			process.exit(1);

		}
	});

import { stdin, stdout } from 'node:process';

import {execSync} from 'node:child_process'

import { startBy, getShell } from "env.ts";

const awaitEditFinish = ({read, write}: {read: string, write: string}) =>
{

	cipher.f_dec(read, write);

	execSync(`${startBy()} \'${write}\'`, {
		windowsHide: true,
		shell: getShell()
	})

	return new Promise<'saved' | 'cancelled'>((resolve) =>
	{
		stdin.setRawMode(true);
		stdin.setEncoding('utf8');
		stdin.resume();

		const listener = async (key: string | Buffer) =>
		{
			const strKey = key.toString();
			
			// Handle Q, q, or Ctrl+C
			if (strKey === 'q' || strKey === 'Q' || strKey === '\u0003') {
				stdin.setRawMode(false);
				stdin.off('data', listener);
				stdin.pause();

				// true: save changes into file
				// false: discard changes

				if (strKey === 'q' || strKey === 'Q') {

					await import('@/logics/beforeClosing.ts')

					console.log("\nExit and save...");
					resolve('saved');

				} else {

					fs.removeSync(write);
					console.log("\nEdit cancelled.");
					resolve('cancelled')
				}
			}
		};

		stdin.on('data', listener);
	});
}

import _path from "@/logics/utils/path.ts";

program.command("edit")
	.argument("<type>", "type of the file to edit")
	.action(async (type) =>
	{

		const res = await branch();

		if (res) {

			const path: {
				read: string,
				write: string
			} | undefined = (() => {
				
				if (type === 'config') {
					return {
						read: _path.usr_config,
						write: _path.u_cfg_cache
					}
				}
				if (type === 'macro') {
					return {
						read: _path.usr_command,
						write: _path.u_cmd_cache
					}
				}
			})()

			if (path === undefined) {
				return console.log('Path fetch failed')
			}

			console.log('\nPress Q/q to exit and save changes.')

			await awaitEditFinish(path);

			stdin.setRawMode(false);
			stdin.pause();


		}

	});

program.parse(process.argv);