import { rib_conf } from "../manage.ts";
import utils from "../utils/utils.ts";

// Try to import interface
import _interface from "../forms/interface.ts";

export default {
    command: 'src',
    description: 'search for commands',
    options: [
        { option: '-t, --type <value>', desc: 'Type of search' },
        { option: '-v --value <value>', desc: 'Value of search' },
        { option: '-m --minified', desc: 'Show minified version' }
    ],
    action: (options: any) => {

        const searchTypes = _interface.search_types || ['tag', 'cmd', 'desc', 'code', 'all'];

        if (!options.type || !searchTypes.includes(options.type)) {
            console.log("Invalid search type. We'll use 'all' as default");
            options.type = 'all';
        }

        const res = rib_conf.src(options.type, options.value, options.minified);

        if (options.minified) {

            if ((res as string[]).length <= 0) return console.log('No macros found');

            if (Array.isArray(res)) {
                return ((utils as any).list_up || console.log)(res as string[]);
            }

        }

        if ((Object.keys(res)).length <= 0) {
            return console.log('No macros found');
        }

        console.log(res)

    }
};
