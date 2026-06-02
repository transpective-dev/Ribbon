import chalk from 'chalk';

import { pallete } from './color.ts';

const base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generate_id(digit: number = 6)
{

	const a = Math.random().toString().slice(2, 2 + digit);
	const b = Math.random().toString(36).slice(2, 2 + digit);

	let final_id = "";

	a.split('').forEach((char, n) =>
	{
		const valA = parseInt(char, 10);
		const valB = base36.indexOf(b[n]!);

		let targetIndex = valA + valB;

		targetIndex = targetIndex % 36;

		final_id += base36[targetIndex];

	});

	return final_id.toUpperCase();

}

function generate_local_time()
{
	return new Date().toLocaleString();
}

import type { t_command_schema } from "../templates/schema.ts";

export const macro_formatter = (res: t_command_schema) =>
{

	console.log('\n')

	const getPad = (i: t_command_schema[string]) =>
	{

		return {
			keyLength: Object.keys(i).reduce((max, key) =>
			{
				return Math.max(max, key.length)
			}, 0) + 2,
		}
	}

	Object.entries(res).forEach(([key, value]) =>
	{

		const columns = process.stdout.columns

		console.log('#', chalk.bold(key))
		console.log('-'.repeat(13))

		const { keyLength } = getPad(value)

		Object.entries(value).forEach(([child_key, child_value]) =>
		{

			switch (child_key) {
				case "safeRun":
					if (child_value) {
						child_value = chalk.hex(pallete.green)("true")
					} else {
						child_value = chalk.hex(pallete.red)("false")
					}
					break;

				case "id":
					child_value = chalk.hex(pallete.orange)(child_value)
					break
				case "time":
					break
				case "desc":
					child_value = chalk.hex(pallete.grey_4)(child_value)
					break;
				default:
					break;
			}

			const log = (child_key.padEnd(keyLength) + chalk.hex(pallete.grey_4)(": ") + child_value) as string

			if (log.length > columns) {


				let left = log

				const arr: string[] = []

				const maxValueLength = columns - keyLength

				while (left.length > maxValueLength) {

					if (arr.length === 0) {

						const sliced = left.slice(0, columns)
						arr.push(sliced)
						left = left.slice(columns)

						continue

					}

					const sliced = left.slice(0, maxValueLength - 2)
					arr.push(' '.repeat(keyLength) + chalk.hex(pallete.grey_6)("| ") + sliced)
					left = left.slice(maxValueLength - 2)

				}

				arr.push(' '.repeat(keyLength) + chalk.hex(pallete.grey_6)("| ") + left)

				arr.forEach((item) =>
				{
					console.log(item)
				})

			} else {
				console.log(log)
			}

		})
		console.log('\n')
	})

	console.log('')
}

import path from 'path'
import { URL } from 'url';

export const command_color_up = (cmd: string) =>
{

	cmd = cmd.replace(/'([^"]*)'/g, '$1');

	const color = {
		option: pallete.grey_4,
		path: pallete.indigo,
		url: pallete.purple,
		str: pallete.orange
	}

	const split = [...cmd.matchAll(/(["'][^"']*["'])|(\S+)/g)].map(m => m[0]);

	return split.map((i) =>
	{

		if (!i) return i;

		const isUrl = (() =>
		{
			try {
				new URL(i)
				return true
			} catch {
				return false
			}
		})()

		if (isUrl) {
			return chalk.hex(color.url)(i)
		}

		const isPath = /^(\.\/|\.\.\/|\/|~|[A-Za-z]:\\)/.test(i) || i.includes('/') || i.includes('\\');

		if (isPath) {
			return chalk.hex(color.path)(i)
		}

		// test option (atgument)
		if ((/^(\-|\-\-)/).test(i)) {
			return chalk.hex(color.option)(i);
		}

		// test string
		if (/^["'].*["']$/.test(i)) {
			return chalk.hex(color.str)(i);
		}

		return i

	}).filter(Boolean)

}


import { spawnSync } from "child_process";
import os from 'os';

import type { shellArgs } from "../templates/interface.ts";
import { rib_conf } from '../../manage.ts';

export const getShell = (cmd: string ): shellArgs =>
{

	const isSmartShellEnabled = rib_conf.getConfig('smartShell') as boolean ?? false;

	const platform = os.platform()
	
	const shell: shellArgs = (() => {

		if (!(rib_conf.getConfig('useShell') as boolean)) {

			return undefined
			
		}
		
		if (platform === 'win32') {

			const find_pwsh = spawnSync('where pwsh', {
				shell: true,
				stdio: 'ignore'
			})

			if (find_pwsh.status === 0) {

				return 'pwsh'
				
			} else {

				const find_powershell = spawnSync('where powershell', {
					shell: true,
					stdio: 'ignore'
				})

				if (find_powershell.status === 0) {
					
					return 'powershell'
					
				}

			}

		} else if (platform === 'linux' || platform === 'darwin') {

			const find_bash = spawnSync('which bash', {
				shell: true,
				stdio: 'ignore'
			})

			if (find_bash.status === 0) {
				return 'bash'
			}
			
		}
		
		return undefined
	})()

	if (!isSmartShellEnabled) {
		return shell
	}

	let find: string | null = null

	if (platform === 'win32') {

		if (shell) {

			find = 'gcm'

		} else {
			
			find = 'where'
			
		}
		
	} else if (platform === 'linux' || platform === 'darwin') {
		
		find = 'which'

	}

	if (!find) {

		return undefined

	}

	// choose from cmd, bash and powershell 7
	if (cmd.includes('&&')) {

		const try_with_useShell = spawnSync('echo test && echo test', {
			shell: shell ?? true,
			stdio: 'ignore'
		})

		if (try_with_useShell.status === 0) {
			return shell
		}

		return undefined;

	}

	const command = cmd.split(' ')[0]?.replaceAll("\"", '').trim();

	// validate existance of command
	if (command) {

		const src_cmd = spawnSync(find as string, [command!], {
			shell: shell ?? true,
			stdio: 'pipe'
		})

		if (src_cmd.status === 0) {
			return shell
		}

	}

	// use native shell
	return undefined

}

import _path from "../utils/path.ts"

import fs from 'fs-extra'

import type { audit_log_argument, audit_log } from '../templates/interface.ts'

export const save_audit_log = (data: audit_log_argument) =>
{

	const date = new Date()
	const today = date.toISOString().split('T')[0]

	const filepath = path.join(_path.paths.audit, `${today}.log.json`)

	const logData: audit_log = {
		timestamp: date.getTime(),
		datetime: date.toLocaleString(),
		cmd: data.cmd as string,
		status: {
			safeRun: data.safeRun as boolean,
			executed: data.executed,
			login: data.login,
		},
		reason: data.reason,
		encounted: {
			keywords: data.encounted?.keywords,
			count: Object.values(data.encounted?.keywords ?? {}).reduce((a, b) => a + b.length, 0)
		}
	}

	if (fs.existsSync(filepath)) {

		const raw = fs.readFileSync(filepath, 'utf-8');
		const json = JSON.parse(raw);
		json.push(logData);
		fs.writeFileSync(filepath, JSON.stringify(json, null, 2));

	} else {

		fs.ensureFileSync(filepath)
		fs.writeFileSync(filepath, JSON.stringify([logData], null, 2));

	}

}

export default {
	generate_id,
	generate_local_time,
	macro_formatter,
	save_audit_log
}