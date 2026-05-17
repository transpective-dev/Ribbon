const { rib_conf } = globalThis._rib_manage;
const { cmd_register } = globalThis._rib_types;

export default {
    command: 'cfg',
    desc: 'Ribbon Configuration',
    options: [
        { option: '-t, --toggle <key>', desc: 'Toggle a configuration' }
    ],
    action: async (options: any) => {

        const settings = rib_conf.all('config', true).settings

        if (options.toggle) {

            if (options.toggle in settings) {

                rib_conf.toggle(options.toggle)

            } else {

                return console.log('no key found in config')

            }

        }

    }
} satisfies typeof cmd_register;