import './src/logics/beforeClosing.ts'

import { spawnChild } from './src/logics/utils/spawn.ts';

const args = process.argv.slice(2);

if (args.length === 0) {
	process.exit(0);
}

for (let i = 0; i < args.length - 1; i++) {
	// current
	const a = args[i];
	// next
	const b = args[i + 1];

	// Extract the key and the value after the first '='
	const regex = /^([^=]+)=(.*)$/;

	if (["add", "regis", "register"].includes(a!) && regex.test(b!)) {
		// Replace b with key='value' so powershell treats the '<' as a string literal
		// We also wrap the entire argument in double quotes and escape inner double quotes
		// so PowerShell passes it as a single argument instead of splitting by spaces.
		const replaced = b!.replace(regex, `$1='$2'`).replace(/"/g, '\\"');
		args[i + 1] = `"${replaced}"`;
	}
}

// get rawCmdString
const rawCommand = args.join(' ');

if (rawCommand === "") {
	process.exit(0);
}

spawnChild({
	cmdString: rawCommand,
	safeRun: false
});