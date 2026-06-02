import { exec } from "node:child_process";
import { rib_conf } from "../../manage.ts";
import { execution_guard } from "./executions/execution_guard.ts";
import chalk from "chalk";
import { pallete } from "./color.ts";
import keytar from 'keytar';
import { acc_password, srv } from "../../../_user/keys.ts";
import path from "path";
import { idx_ribbon } from "../../../env.ts";
import type { audit_log_argument, shellArgs } from "../templates/interface.ts";
import { getShell, save_audit_log } from "./utils.ts";

export const isRibCmd = (cmd: string): string =>
{

	const regex = /(?:^|\s)\brib\b(?:\s|$)/g

	const bin = process.env.RIB_EXE?.endsWith('.exe')

	const ifRib = bin ? `"${path.join(process.env.GET_ROOT as string, idx_ribbon)}" ` : `bun run "${process.env.RIB_EXE}" `

	if (regex.test(cmd)) {


		return cmd.replace(regex, ifRib);
	}

	return cmd;

}

const init_spawn_config = (cmdString: string, shell: shellArgs, isRib: boolean): string[] =>
{

	if (isRib) {

		return [cmdString];
	}

	if (shell === 'powershell' || shell === 'pwsh') {

		// reject interaction and return error
		// prevent direct exit from system
		return [shell as string, '-NonInteractive', '-NoProfile', '-Command', cmdString];

	} else if (shell === 'bash') {

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
}: spawner): Promise<audit_log_argument> =>
{

	return new Promise(async (resolve, reject) =>
	{

		let _cmdString = isRibCmd(cmdString);

		const getAuditArguments = ({
			reason = '',
			login = false,
			executed = false,
			encounted = {
				keywords: {}
			}
		}: audit_log_argument): audit_log_argument =>
		{
			return {
				cmd: cmdString,
				safeRun,
				reason,
				login,
				executed,
				encounted
			}
		}

		console.log(`\nRunning: ${chalk.hex(pallete.grey_4)(_cmdString)}\n`)

		if (typeof await keytar.getPassword(srv, acc_password) !== 'string') {
			console.log('Please Initialize Your Account')
			return reject(getAuditArguments({
				reason: 'Password Not Initialized',
				login: false,
				executed: false,
				encounted: {
					keywords: {}
				}
			}))
		}

		const byEG = await execution_guard({
			cmdString,
			safeRun
		})

		if (!(byEG)?.status) {
			return reject(getAuditArguments({
				reason: byEG.reason,
				login: byEG.reason === 'Token Expired' ? false : true,
				executed: false,
				encounted: {
					keywords: Object.fromEntries(byEG.detected.map((i) =>
					{
						return [i.group, i.matched]
					}))
				}
			}))
		}

		// kill child process
		const kill = (status: boolean, msg?: string) =>
		{
			child.kill();
			status ? resolve(getAuditArguments({
				reason: 'Passed',
				login: byEG.reason === 'Token Expired' ? false : true,
				executed: true,
				encounted: {
					keywords: Object.fromEntries(byEG.detected.map((i) =>
					{
						return [i.group, i.matched]
					}))
				}
			})) : reject(getAuditArguments({
				reason: `Execution Failed: ${msg ?? 'Unknown Error'}`,
				login: byEG.reason === 'Token Expired' ? false : true,
				executed: true,
				encounted: {
					keywords: Object.fromEntries(byEG.detected.map((i) =>
					{
						return [i.group, i.matched]
					}))
				}
			}))
		}

		const shell = (() =>
		{
			return getShell(_cmdString);

		})();

		const _arguments = init_spawn_config(_cmdString, shell, !Boolean(_cmdString === cmdString));

		// using exec is for spawn is unable to run ribbon.exe.
		const child = exec(_arguments.join(' '), {
			shell: shell,
			signal: signal,
			env: {
				...process.env,
				FORCE_COLOR: '1'
			}
		});

		// exec buffers output, so we need to pipe it to stdout/stderr for real-time streaming
		child.stdout?.pipe(process.stdout);
		child.stderr?.pipe(process.stderr);

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
	}).then((res) =>
	{
		save_audit_log(res);
	}).catch((err) =>
	{
		save_audit_log(err);
	});

}