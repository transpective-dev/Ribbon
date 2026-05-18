const { rib_conf } = globalThis._rib_manage;
import utils from "../src/logics/utils/utils.ts";
const { cmd_register } = globalThis._rib_types
import type { t_command_schema } from "../src/logics/templates/schema.ts";

export default {
    command: 'register',
    alias: ['regis', 'rgs', 'add'],
    argument: [
        '<i...>'
    ],
    options: [
        { option: '-d, --desc <value>', desc: 'Description of the command' },
    ],
    desc: "register new command \n\ngrammer: rib $/regis name='command' -d 'desc' -a 'abstract' -t 'tag1, tag2...'",
    action: (i: any, options: any) => {

        i = i.join(' ');

        // split into two parts 
        const parts = i.split(/=(.*)/s).filter(Boolean);

        let [key, value] = parts;

        key = key.trim();

        if (rib_conf.has(key)) {
            console.log('error: command already exists');
            return;
        }

        if (options?.abstract?.length > 30) {

            console.log('abstract-error: abstract must be less than 30 characters');

            options.abstract = (options.abstract as string).slice(0, 30) + '...';

            console.log(`after trimmed: ${options.abstract}`);

        }

        if (!value) {
            console.log("format-error: please use key='command'");
            return;
        }

        // Strip quotes and trim
        const cleanCmd = value.replace(/^"(.*)"$/, '$1').trim();

        const content: t_command_schema[string] = {
            id: utils.generate_id(),
            time: utils.generate_local_time(),
            desc: options.desc || "No description provided",
            cmd: cleanCmd,
	    safeRun: false,
        }

        const res = rib_conf.register(key, content);

        if (res.status) {
            (() => {
                const config = rib_conf.all('config') as any;
                if (config.settings.showMacro) {
                    utils.log_formatter('Command registered: ', rib_conf.get(key));
		    return
                }
            })();
        } else {
            console.log(`Command registration failed: ${res.msg}`);
        }

    }
} satisfies typeof cmd_register;