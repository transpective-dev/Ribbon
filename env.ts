// initializing env 

import path from "path";
import { fileURLToPath } from "url";

import { execPath } from "process";

// Node.js ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root_path = {
	// root when packed
	fromExec: path.dirname(execPath),

	// root when dev
	fromDev: __dirname,
};

const idx_ribbon = "ribbon.exe";
const idx_user = "user.exe";
const idx_utils = "utils.exe";
const idx_execute = "execute.exe";


const env = process.env;

env.ROOT_STATUS = 'false'; // allow user to switch admin mode
env.GET_ROOT = undefined; // get the root path
env.INDEX_FILE = undefined; // get the entry point of the application

if (root_path.fromExec.endsWith('.exe')) {

	// top dir (the folder containing launcher.exe)
	env.GET_ROOT = root_path.fromExec;

	// point to exe file
	env.IS_DEV = 'false';

	env.RIB_EXE = path.join(env.GET_ROOT, idx_ribbon);
	env.USR_EXE = path.join(env.GET_ROOT, idx_user);
	env.UTI_EXE = path.join(env.GET_ROOT, idx_utils);
	env.EXE_EXE = path.join(env.GET_ROOT, idx_execute);

} else {

	// dev mode
	env.GET_ROOT = root_path.fromDev;

	env.IS_DEV = 'true';

	env.RIB_EXE = path.join(env.GET_ROOT, 'src', 'ribbon.idx.ts');
	env.USR_EXE = path.join(env.GET_ROOT, 'user.idx.ts');
	env.UTI_EXE = path.join(env.GET_ROOT, '_user', 'utils', 'index.ts');
	env.EXE_EXE = path.join(env.GET_ROOT, '_user', 'index.ts');

}

export const isBin = () => {
	return execPath.endsWith(idx_user);
}

// get os 

(() =>
{
	const i = process.platform;
	switch (i) {
		case 'win32': return process.env.USR_PLATFORM = 'win';
		case 'darwin': return process.env.USR_PLATFORM = 'mac';
		case 'linux': return process.env.USR_PLATFORM = 'lnx';
		default: return process.env.USR_PLATFORM = 'unknown';
	}
})();

export const getOS = () =>
{
	return process.env.USR_PLATFORM;
}

export const startBy = () =>
{
	switch (process.env.USR_PLATFORM) {
		case 'win': return 'start';
		case 'mac': return 'open';
		case 'lnx': return 'xdg-open';
	}
}

export const spawnNewInput = (executable: string, action: string, args: string[]): string =>
{
	switch (getOS()) {
		case 'lnx': {
			return `x-terminal-emulator -e bash -c "bun run ${executable} ${action} ${args.join(' ')} ; read -p 'Press Enter to exit...'" || gnome-terminal -- bash -c "bun run ${executable} ${action} ${args.join(' ')} ; read -p 'Press Enter to exit...'" || xterm -e bash -c "bun run ${executable} ${action} ${args.join(' ')} ; read -p 'Press Enter to exit...'"`;
		}
		case 'mac': {
			return `osascript -e 'tell app "Terminal" to do script "bun run ${executable} ${action} ${args.join(' ')} ; read -p \\"Press Enter to exit...\\""'`;
		}
		case 'win':
		default: {
			return `start "" /wait cmd.exe /c "bun run "${executable}" ${action} ${args.join(' ')} || pause"`;
		}
	}
};

export const getShell = () =>
{
	switch (getOS()) {
		case 'win': {
			return 'powershell.exe';
		}
		default: {
			return '/bin/bash'
		}
	}
}