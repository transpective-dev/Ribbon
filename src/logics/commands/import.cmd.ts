import type { cmd_register } from "../forms/interface.ts";

export default {
    command: 'import',
    argument: '<path> <alia>',
    desc: 'Import a command',
    action: (path: string, alia: string) => {
        console.log(path, alia);
    }
} as cmd_register;