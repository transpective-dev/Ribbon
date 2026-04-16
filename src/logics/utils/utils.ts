const base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generate_id() {

    const a = Math.random().toString().slice(2, 2 + 6);
    const b = Math.random().toString(36).slice(2, 2 + 6);

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

import type { t_command_schema } from "../forms/schema.ts";

function log_formatter(msg: string, detail: t_command_schema[string]) {

    return [
        console.log(`\n${msg}\n`),
        console.log(detail),
        console.log("\n")
    ]

}

const textCenter = (text: string, pad: number) => {
    return ' '.repeat(pad) + text + ' '.repeat(pad);
}

const header = {
    id: textCenter('ID', 6),
    alia: textCenter('ALIA', 10),
    t: textCenter('<T>', 1),
    abs: textCenter('ABSTRACT', 12),
    time: textCenter('TIME', 10),
}

function list_up(ls: string[]) {

    console.log('\n');
    console.log(Object.values(header).join(' | '));
    console.log('-'.repeat(Object.values(header).join(' | ').length));

    ls.forEach((i) => console.log(i))

    console.log('\n');

    return
}

function getGroupAndKey(str: string): {
    key: string | undefined,
    group: string | undefined
} {

    // group and name should not includes '.'

    // group name or key name shouldn't startwith '.'
    if (str.startsWith('.')) {
        return {key: str, group: undefined}
    }

    const splited = str.split('.')

    if (splited.length === 2) {
        return {key: splited[1], group: splited[0]}
    }

    return {key: str, group: undefined}

}

export default {
    generate_id,
    generate_local_time,
    log_formatter,
    header,
    list_up,
    getGroupAndKey
}