export default {
    command: 'import',
    argument: '<type>',
    options: [
        { option: '-p, --path <value>', desc: 'Path to the command' },
    ],
    desc: 'Import a command',
    action: (type: string, options: any) => {
        console.log(type, options);
    }
}