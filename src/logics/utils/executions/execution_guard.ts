import _interface from "../../templates/interface.ts";
import { rib_conf } from "../../../manage.ts";
import { type t_config_schema } from "../../templates/schema.ts";

import { cacheManager } from '../../../../_user/expiry.ts'

import chalk from 'chalk'

import { pallete } from "../color.ts";

/**
 * Independent Execution Guard  
 * Checks if the final command violates any regex policies
 * 
 * @param cmdString provide command you want to check
 * @returns boolean (true = no keywords found, false = keywords found)
 */

export const execution_guard = async (cmd: {
	cmdString: string;
	safeRun: boolean;
}): Promise<boolean> =>
{

	// true: allow users to run command macro with safeRun: true. 
	// false: only allowed to run command macro, which is not filtered out.
	const execution_token = await (async () =>
	{

		const isValid = await cacheManager?.isExpired()

		console.log(isValid)

		return !isValid

	})()

	const config = rib_conf.all('config') as t_config_schema;

	const filters = config.filter || {};

	// violations vault
	const detected: { group: string; matched: string[], msg: string }[] = [];

	for (const [groupName, rule] of Object.entries(filters)) {

		// checking the regex patterns setup by user
		const ruleRegex = (rule as any).keywords || [];

		const matched = ruleRegex.filter((r: string) =>
		{
			try {

				// global pattern search
				return new RegExp(r, 'gi').test(cmd.cmdString);

			} catch (e) {

				// gracefully ignore ill-formed patterns
				return false;
			}
		});

		if (matched.length > 0) {
			detected.push({
				group: groupName,
				matched: matched,
				msg: (rule as any).msg || `WARNING: We have detected [ ${groupName} ]`
			});
		}
	}

	// Pass safely if no violations
	if (detected.length === 0) return true;

	// block if token is false or saferun is false
	if (!execution_token || !cmd.safeRun) {
		printReport({ cmd, detected, token: execution_token!, isSafeRun: cmd.safeRun });
		return false;
	}


	return true;
};

const printReport = ({
	cmd,
	detected,
	token,
	isSafeRun
}: {
	cmd: {
		cmdString: string;
		safeRun: boolean;
	}
	token: boolean,
	isSafeRun: boolean
	detected: { group: string; matched: string[], msg: string }[]
}) =>
{

	const bars = {
		a: chalk.hex(pallete.grey_6)('-------------'),
		b: chalk.hex(pallete.grey_6)('='.repeat(15))
	}

	const joiner = (parts: string[], join_text: string = '\n', edge: 'b' | 'l' | 'both' | 'none' = 'none') =>
	{

		const base = parts.join(join_text);

		switch (edge) {
			case 'both': return `\n${base}\n`;
			case 'b': return `\n${base}`;
			case 'l': return `${base}\n`;
			default: return base;
		}

	}

	let highlighted = cmd.cmdString;

	let encounter: {
		[key: string]: {
			count: number,
			group: string,
		}
	} = {};

	// highlight all matched regex patterns
	detected.forEach(d =>
	{
		d.matched.forEach(r =>
		{
			try {
				const regex = new RegExp(`(${r})`, 'gi');

				highlighted = highlighted.replace(regex, (match) =>
				{

					const stripped = match.replace('(?:^|\\s)\\b', '').replace('\\b(?:\\s|$)', '');

					encounter[stripped] = {
						count: (encounter[stripped]?.count || 0) + 1,
						group: d.group
					}

					return chalk.red.bold(match)
				});

			} catch (e) { }
		});
	});

	const infos = {
		'Token State': token ? chalk.hex(pallete.green)('Valid') : chalk.hex(pallete.red)('Expired'),
		'Encounted Threats': Object.values(encounter).reduce((acc, val) =>
		{
			return acc + val.count;
		}, 0),
		'Safe Run': isSafeRun ? chalk.hex(pallete.green)('Enabled') : chalk.hex(pallete.red)('Disabled')
	}

	const longest_info = Math.max(...Object.entries(infos).map(([key, _]) => key.length)) + 3

	console.log(joiner([bars.b, 'Execution Guard Report', bars.b], ' ', 'l'));

	const getReason = () =>
	{
		if (!token) {
			return "TOKEN EXPIRED"
		}
		if (!isSafeRun) {
			return "SAFE RUN DESABLED"
		}
	}
	console.log(`REASON: ${getReason()}\n\n`)
	console.log(joiner([chalk.hex(pallete.orange)('INFO:'), bars.a, ...Object.entries(infos).map(([key, value]) => `${key.padEnd(longest_info, ' ')}: ${value}`)], '\n'))
	console.log(joiner(['\n', chalk.hex(pallete.orange)('COMMAND: '), bars.a, highlighted], '\n', 'l'));

	let details_length = {
		case: Math.max(...Object.keys(encounter).map((i) => i.length)) + 3,
		count: Math.max(...Object.values(encounter).map((i) => i.count)) + 3,
		group: Math.max(...Object.values(encounter).map((i) => i.group.length)) + 3,
	}

	details_length = Object.fromEntries(Object.entries(details_length).map(([key, value]) =>
	{
		return [key, value + key.length]
	})) as typeof details_length

	const header = Object.entries(details_length).map(([key, value]) => `${key.padEnd(value, ' ')}`).join('')

	const divider = Object.values(details_length).map((i) => '-'.repeat(6).padEnd(i)).join('')

	console.log('\n\n' + header);
	console.log(divider)
	Object.entries(encounter).forEach(([key, value]) =>
	{
		console.log(`${key.trim().padEnd(details_length.case, ' ')}${value.count.toString().padEnd(details_length.count, ' ')}${value.group.padEnd(details_length.group, ' ')}`);
	});

	console.log('\n')

}