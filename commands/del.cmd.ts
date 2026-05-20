const { rib_conf } = globalThis._rib_manage;
const { utils } = globalThis._rib_utils;
const { cmd_register } = globalThis._rib_types;
const { prompt } = globalThis._rib_mod_enquirer;

export default {
    command: 'del',
    argument: [
        '<name>'
    ],
    desc: 'Delete a command',
    action: async (name: any) => {

        const config = rib_conf.all('config') as any;

        const res = rib_conf.delete(name);

        if (res.status) {
            console.log(`Command deleted successfully: ${name}`);
        } else {
            console.log(`Command deletion failed: ${res.msg}`);
        }

    }
} satisfies typeof cmd_register