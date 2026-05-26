import { spawn, spawnSync } from "node:child_process";
import { rib_conf } from "../../manage.ts";
import { execution_guard } from "./executions/execution_guard.ts";
import { startBy } from "../../../env.ts";
import chalk from "chalk";
import { pallete } from "./color.ts";
import keytar from 'keytar';
import { acc_password, srv } from "../../../_user/keys.ts";

const isWindows = process.platform === 'win32';

const shellStatus = () =>
{

	const useShell = rib_conf.getConfig('useShell') as boolean;

	if (useShell) {
		return isWindows ? 'powershell.exe' : '/bin/bash';
	}

	return true;
}

export const isRibCmd = (cmd: string): string =>
{

	const regex = /(?:^|\s)\brib\b(?:\s|$)/g

	const ifRib = process.env.RIB_EXE?.endsWith('.exe') ? `${startBy()!} "${process.env.RIB_EXE}" ` : `bun run "${process.env.RIB_EXE}" `

	if (regex.test(cmd)) {
		return cmd.replace(regex, ifRib);
	}

	return cmd;

}

const init_spawn_config = (cmdString: string, shell: ReturnType<typeof shellStatus>): string[] =>
{

	if (shell === 'powershell.exe') {
		// reject interaction and return error
		// prevent direct exit from system
		return [shell as string, '-NonInteractive', '-NoProfile', '-Command', cmdString];
	} else if (shell === '/bin/bash') {
		return [shell as string, '--noprofile', '--norc', '-c', cmdString];
	}

	return [cmdString];

}

interface spawner
{
	cmdString: string;
	safeRun: boolean;
	signal?: AbortSignal | undefined;
}

export const spawner = ({
	cmdString,
	safeRun = false,
	signal,
}: spawner) =>
{

	return new Promise(async (resolve, reject) =>
	{

		let _cmdString = isRibCmd(cmdString);

		console.log(`\nRunning: ${chalk.hex(pallete.grey_4)(_cmdString)}\n`)

		if (typeof await keytar.getPassword(srv, acc_password) !== 'string') {
			console.log('Please Initialize Your Account')
			return reject(false)
		}

		if (!await execution_guard({
			cmdString,
			safeRun
		})) {
			return reject(false);
		}

		// return msg if pipe
		let message: string | undefined;

		// kill child process
		const kill = (status: boolean) =>
		{
			child.kill();
			status ? resolve({
				state: true,
				message
			}) : reject({
				state: false,
				message
			})
		}

		const shell = shellStatus();

		const _arguments = init_spawn_config(_cmdString, shell);

		const executable = _arguments.shift()!;
		const isShellMode = typeof shell === 'boolean' ? shell : false;

		const child = spawn(executable, _arguments, {
			shell: isShellMode,
			signal: signal,
			stdio: 'inherit',
			env: {
				...process.env,
				FORCE_COLOR: '1'
			}
		});

		child.on('exit', (code) =>
		{
			code === 0 ? kill(true) : kill(false)
		});

		child.on('error', (err) =>
		{
			kill(false);
		});

	})
}

export const spawnChild = ({
	cmdString,
	safeRun,
	signal
}: spawner) =>
{

	// then/catch for keeps console clean
	spawner({
		cmdString,
		safeRun,
		signal
	}).then((res: any) =>
	{
		if (res && res.message) process.stdout.write(res.message);
	}).catch((err: any) =>
	{
		if (err && err.message) process.stdout.write(err.message);
	});

}