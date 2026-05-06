import chalk from "chalk";
import { pallete } from "../src/logics/utils/color.ts";
import strWidth from 'string-width'

// keymap 

export const keyMap = {
    'ctrl+c': '\u0003',
    'move_cursor': (direction: 'r' | 'l' | 'd' | 'u', step: number = 1) => {

        const assign = (char: string) => {
            return `\x1b[${step}${char}`
        }

        switch (direction) {
            case 'r': return assign('C'); // move right
            case 'l': return assign('D'); // move left
            case 'd': return assign('B'); // move down
            case 'u': return assign('A'); // move up
        }
    },
    'erase': (type: 'l' | 'd') => {

        switch(type){
            case 'l': return "\x1b[k" // erase in line
            case 'd': return "\x1b[J" // erase from cursor to the end 
        }

    }
}

export type T_keyMap = keyof typeof keyMap;

export const isKey = (key: string, targetKey: T_keyMap): T_keyMap | 'no_found_key' => {

    if (key === keyMap[targetKey]) {
        return targetKey;
    }

    return 'no_found_key';
}

let activeController: AbortController | undefined;

export const handler = {

    'exit': () => {
        if (activeController) {
            console.log("\n[!] aborted by user\n");
            activeController.abort(); // Kills the running child process via AbortSignal
        } else {
            // If no process is running, Ctrl+C closes the REPL entirely
            console.log("\n\nExiting Ribbon...");
            process.exit(0);
        }
    },
    "move_between": ({
        direction, step, start = false
    }: {
        direction: 'u' | 'd' | 'l' | 'r',
        step: number
        start: boolean
    }) => {

        let converted = keyMap.move_cursor(direction, step);

        if (start) {
            converted += '\r'
        }

        return stdout.write(converted);

    }

}

// controller 

const prefix = () => {
    return `[${process.env.ROOT_STATUS === 'true' ? chalk.hex(pallete.red)('ROOT') : chalk.hex(pallete.green)('NORMAL')}] MOOD-CORE > `
};

import { stdin, stdout } from 'node:process';

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

let buffer = "";
let visual_length = 0;
let suggestion = "run-test-command"; // 假设这是匹配到的建议

let is_prefix_initialized = false

const is_overflow = (): { overflow: boolean, actual_lines: number, estimated_lines: number } => {

    const get_col = () => stdout.columns;

    const estimated_lines = Math.ceil((visual_length + 1) / get_col())

    const overflow = estimated_lines > 1

    const actual_lines = buffer.split('\n').length

    return {
        overflow,
        actual_lines,
        estimated_lines
    }

}

const handle_buffer_change = (type: 'add' | 'del', char?: string) => {
    switch (type) {
        case 'add':
            if (char) stdout.write(char);
            break;
        case 'del':
            // 针对性删除：光标左移一格，输出空格覆盖原字符，再左移一格
            stdout.write('\b \b');
            break;
    }
}

const render = () => {

    visual_length = strWidth(prefix() + buffer) + 1;

    if (!is_prefix_initialized) {
        // initialize prefix
        stdout.write(prefix())
        is_prefix_initialized = true
    }

    // 注意：不再调用 stdout.write(buffer) 导致全局重绘！
    // 输入和删除的字符变更已经由 handle_buffer_change 处理完毕。

    // 3. 如果有建议，打印灰色部分
    const ghostText = (): string => {
        if (suggestion.startsWith(buffer) && buffer.length > 0) {
            return suggestion.slice(buffer.length)
        }
        return ''
    };

    const current_ghost = ghostText();

    if (current_ghost.length > 0) {
        stdout.write(`\x1b[90m${current_ghost}\x1b[0m`); // 90m 是灰色
    }

    // 利用 [K 清除当前光标到行尾的残余字符（比如旧的更长的 ghost text，或退格后留下的残余）
    // 这样不用清空整行重绘，彻底避免了前缀和已输入内容的闪烁
    stdout.write('\x1b[K');

    if (current_ghost.length > 0) {
        // move back to right place
        stdout.write(`\x1b[${current_ghost.length}D`);
    }

};

stdin.on('data', (key: string) => {
    // 处理 Ctrl+C 退出
    if (key === '\u0003') process.exit();

    // 处理 Enter (回车)
    if (key === '\r' || key === '\n') {
        // 回车前先清除屏幕上的 ghost text，避免它作为实体字符保留在输出记录中
        stdout.write('\x1b[K');
        console.log('\n执行指令:', buffer);
        buffer = "";
        is_prefix_initialized = false; // 重置前缀标志，保证下一行重新打印前缀
        render();
        return;
    }

    // 处理 Backspace (退格)
    if (key === '\u007f' || key === '\u0008') {
        if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            handle_buffer_change('del');
        }
    }
    // 处理 Tab (补全)
    else if (key === '\t') {
        if (suggestion.startsWith(buffer) && buffer.length < suggestion.length) {
            const remainder = suggestion.slice(buffer.length);
            buffer = suggestion;
            handle_buffer_change('add', remainder);
        }
    }
    // 普通字符输入 (过滤掉控制字符)
    else if (key.length === 1 && key.charCodeAt(0) >= 32) {

        const { overflow, estimated_lines, actual_lines } = is_overflow();

        if (overflow && (actual_lines < estimated_lines)) {
            buffer += '\n' + key
            handle_buffer_change('add', '\n' + key);
        } else {
            buffer += key;
            handle_buffer_change('add', key);
        }

    }

    render();

});

render();
