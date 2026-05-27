import { execSync } from 'child_process';
import path from 'path';
import _path from '../../src/logics/utils/path.ts';
import { spawnNewInput } from '../../env.ts';
import { cleanFiles } from '../../src/logics/beforeClosing.ts';

import { idx_utils } from '../../env.ts';


const dev = process.env.IS_DEV === "true";

const executable = (() =>
{

	if (dev) {
		return path.join(process.env.GET_ROOT as string, '_user', 'utils', 'index.ts')
	}

	return path.join(process.env.GET_ROOT as string, idx_utils)
})();

export const spawnInput = async ({
	action,
	type
}: {
	action: string
	type?: string
}) =>
{

	const commandString = spawnNewInput(executable, action, [type ?? ""]);

	execSync(commandString, {
		windowsHide: false,
		env: {
			...process.env,
			OUTPUT_FILE: _path.paths.state
		}
	});

	// clean cache if user exit by closing window directly
	cleanFiles();

}
