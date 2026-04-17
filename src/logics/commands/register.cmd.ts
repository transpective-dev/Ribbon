import { rib_conf } from "../manage.ts";
import utils from "../utils/utils.ts";

export default {
    command: 'register',
    alias: 'regis',
    argument: [
        '<i>'
    ],
    options: [
        { option: '-d, --desc <value>', desc: 'Description of the command' },
        { option: '-a, --abstract <value>', desc: 'Abstract of the command' },
        { option: '-t, --tags <value>', desc: 'Tags of the command' },
        { option: '-g, --group <value>', desc: 'Group of the command' },
    ],
    desc: 'register new command',
    action: (i: any, options: any) => {

        // split into two parts 
        const parts = i.split(/=(.*)/s).filter(Boolean);

        const [key, value] = parts;

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

        const tags = options.tags && (options.tags as string).split(',').map((tag) => tag.trim());

        const content = {
            id: utils.generate_id(),
            time: utils.generate_local_time(),
            abs: options.abstract || 'No abstract provided',
            desc: options.desc || "No description provided",
            cmd: cleanCmd,
            tags: tags || [],
        }

        const res = rib_conf.register(key, content);

        if (res.status) {
            (() => {
                const config = rib_conf.all('config') as any;
                if (config.settings.showMacro) {
                    return [...utils.log_formatter('Command registered: ', rib_conf.get(key))];
                }
            })();
        } else {
            console.log(`Command registration failed: ${res.msg}`);
        }

    }
};