import { execSync } from 'child_process';
import path from 'path';
import { spawnNewInput } from '../../env.ts';

const outputFile = path.join(process.env.GET_ROOT as string, '.cache', '.state');

const executable = path.join(process.env.GET_ROOT as string, '_user', 'utils', 'index.ts');

export const spawnInput = async ({
	action
}: {
	action: string
}) =>
{

	const commandString = spawnNewInput(executable, action);

	execSync(commandString, {
		windowsHide: false,
		env: {
			...process.env,
			OUTPUT_FILE: outputFile
		}
	});

}
