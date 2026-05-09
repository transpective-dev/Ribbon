import chalk from "chalk";
import { pallete } from "../src/logics/utils/color.ts";
import strWidth from 'string-width'
import { isRibCmd, spawnChild } from '../src/api/spawn.ts'
import { direction, type t_direction } from './interface.ts'

// keymap 

export const keyMap = {
	'ctrl+c': '\u0003',
	'move_cursor': (direction: t_direction, step: number = 1) =>
	{

		type t_assign = (char: string) => string;

		let assign: t_assign;

		// for extract keymap and debug
		if (step === 0) {

			assign = (char: string) =>
			{
				return `\x1b[${char}`
			}

		} else {

			assign = (char: string) =>
			{
				return `\x1b[${step}${char}`
			}

		}


		switch (direction) {
			case 'r': return assign('C'); // move right
			case 'l': return assign('D'); // move left
			case 'd': return assign('B'); // move down
			case 'u': return assign('A'); // move up
		}
	},
	'erase': (type: 'l' | 'd') =>
	{

		switch (type) {
			case 'l': return "\x1b[k" // erase in line
			case 'd': return "\x1b[J" // erase from cursor to the end 
		}

	}
}

export type T_keyMap = keyof typeof keyMap;

export const isKey = (key: string, targetKey: T_keyMap): T_keyMap | 'no_found_key' =>
{

	if (key === keyMap[targetKey]) {
		return targetKey;
	}

	return 'no_found_key';
}

let activeController: AbortController | null;

export const handler = {

	'exit': () =>
	{
		if (activeController) {
			console.log("\n[!] aborted by user\n");
			activeController.abort(); // Kills the running child process via AbortSignal
		} else {
			// If no process is running, Ctrl+C closes the REPL entirely
			console.log("\n\nExiting mood-core ...");
			process.exit(0);
		}
	},
	"move_between": ({
		direction, step, start = false
	}: {
		direction: 'u' | 'd' | 'l' | 'r',
		step: number
		start: boolean
	}) =>
	{

		let converted = keyMap.move_cursor(direction, step);

		if (start) {
			converted += '\r'
		}

		return stdout.write(converted);

	}

}

// controller 

const prefix = () =>
{
	const user_status = () =>
	{

		const rs = process.env.ROOT_STATUS;

		switch (rs) {

			case 'true': return chalk.hex(pallete.red)('ROOT')

			case 'false': return chalk.hex(pallete.green)('NORMAL')

			default: return chalk.hex(pallete.grey_4)('UNKNOWN')

		}

	}

	return `[${user_status()}] MOOD-CORE > `
};

import { stdin, stdout } from 'node:process';

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// main buffers
let buffer = "";
let visual_buffer = "";
let visual_length = 0;
let suggestion = "run-test-command"; // auto-fill

let is_prefix_initialized = false

// get display column dynamically
const display_col = () => stdout.columns;

import backlander from '../src/background_console/index.ts'

const bc = await backlander.backlander({ dispose: 'auto' })

const handle_buffer_change = (type: 'add' | 'del', char?: string) =>
{


	switch (type) {

		case 'add':

			let build_up: string | null = null

			if (char) {

				// handle \n end 

				// save a space for later adding 
				if (visual_length % (display_col() - 1) === 0) {
					build_up = char + '\n'
				} else {
					build_up = char
				}

			}


			if (build_up) {
				stdout.write(build_up)
			};

			buffer += build_up || '';

			break;

		case 'del':

			bc.log(visual_length + ' ' + buffer.length)

			stdout.write('\b \b');

			const split_by_newline = buffer.split('\n')

			const last_obj = split_by_newline.pop()

			const sliced = last_obj?.slice(0, -1)

			if (sliced) {

				split_by_newline.push(sliced)

			}

			const rebuild = split_by_newline.join('\n')

			buffer = rebuild;

			// visual length only calc printable characters
			const K = display_col() - 1;

			const is_line_start = (visual_length - 1) > 0 && (visual_length - 1) % K === 0;

			if (is_line_start) {
				stdout.write(keyMap.move_cursor('u', 1) + '\x1b[999C');
			}

			break;
	}

}

const render = () =>
{

	visual_buffer = prefix() + buffer;

	visual_length = strWidth(visual_buffer) + 1;

	if (!is_prefix_initialized) {

		// initialize prefix
		stdout.write(prefix())
		is_prefix_initialized = true

	}

	// 注意：不再调用 stdout.write(buffer) 导致全局重绘！
	// 输入和删除的字符变更已经由 handle_buffer_change 处理完毕。

	// 3. 如果有建议，打印灰色部分
	const ghostText = (): string =>
	{
		if (suggestion.startsWith(buffer) && buffer.length > 0) {
			return suggestion.slice(buffer.length)
		}
		return ''
	};

	const current_ghost = ghostText();

	if (current_ghost.length > 0) {
		stdout.write(`\x1b[90m${current_ghost}\x1b[0m`); // 90m is gray
	}

	// use [K to clear current cursor to the end of the line
	stdout.write('\x1b[K');

	if (current_ghost.length > 0) {
		// move back to right place
		stdout.write(`\x1b[${current_ghost.length}D`);
	}

};

stdin.on('data', async (key: string) =>
{

	// handle ctrl + c (exit)
	if (key === '\u0003') handler.exit();

	if (key === '\r' || key === '\n') {

		// clean output
		stdout.write('\x1b[K');

		const cleaned = buffer.replace(/\n|\r/g, '')

		try {

			const answer = isRibCmd(cleaned);

			// Create the controller early so Ctrl+C during prompt doesn't exit the whole app
			activeController = new AbortController();

			console.log(`\n\n${chalk.hex(pallete.grey_4)("Running : ")}${answer}\n`);

			// Pass the signal down to spawnChild
			await spawnChild({
				cmd: answer,
				signal: activeController.signal,
			});

		} catch (e) {

			if (e !== false) {

				console.log("something went wrong: ", e);

			}

		} finally {

			// Clear the controller once the process naturally exits or gets killed
			activeController = null;

		}


		const resetter = () =>
		{
			buffer = "";
			is_prefix_initialized = false;
			render();
		}

		return resetter();

	}

	// handle cursor move
	handle_arrow_key(key);

	// handle backspace
	if (key === '\u007f' || key === '\u0008') {
		if (buffer.length > 0) {
			handle_buffer_change('del');
		}
	}
	// handle tab (auto complete)
	else if (key === '\t') {
		if (suggestion.startsWith(buffer) && buffer.length < suggestion.length) {
			const remainder = suggestion.slice(buffer.length);
			handle_buffer_change('add', remainder);
		}
	}
	// handle normal chars
	else if (key.length === 1 && key.charCodeAt(0) >= 32) {

		handle_buffer_change('add', key);

	}

	render();

});

render();

const handle_arrow_key = (key: string) => 
{

	const extracted: string[] = [];

	direction.forEach((i: string) =>
	{
		extracted.push(keyMap.move_cursor(i as t_direction, 0));
	});

	if (extracted.includes(key)) {
		bc.log('a')
		stdout.write(key)
	}

}
