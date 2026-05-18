const base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generate_id(digit: number = 6) {

    const a = Math.random().toString().slice(2, 2 + digit);
    const b = Math.random().toString(36).slice(2, 2 + digit);

    let final_id = "";

    a.split('').forEach((char, n) => {
        const valA = parseInt(char, 10);
        const valB = base36.indexOf(b[n]!);

        let targetIndex = valA + valB;

        targetIndex = targetIndex % 36;

        final_id += base36[targetIndex];

    });

    return final_id.toUpperCase();

}

function generate_local_time() {
    return new Date().toLocaleString();
}

import type { t_command_schema } from "../templates/schema.ts";

function log_formatter(msg: string, detail: t_command_schema[string]) {

	const longest = Object.keys(detail).reduce((max, key) => {
		return Math.max(max, key.length)
	}, 0) + 2

        console.log(`\n${msg}\n`+'-'.repeat(msg.length + 3))
	Object.entries(detail).forEach(([key, value]) => {
		return console.log(`${key.padEnd(longest, " ")} | ${value}`)
	})
        console.log("\n")
}

const header = {
    id: 'ID',
    alia: 'ALIA',
    t: '<T>',
    abs: 'ABSTRACT',
    time: 'TIME',
    group: 'GROUP'
}

export default {
    generate_id,
    generate_local_time,
    log_formatter,
    header,
}