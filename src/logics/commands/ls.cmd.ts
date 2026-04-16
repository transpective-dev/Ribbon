import { rib_conf } from "../manage.ts";
import utils from "../utils/utils.ts";

export default {
    command: 'ls',
    options: [
        { option: '-f --full', desc: 'see original' }
    ],
    description: 'List up commands',
    action: (options: any) => {

        if (options.full) {
            return console.log(rib_conf.ls({ isFull: true }));
        }

        const list_up = (utils as any).list_up || ((arr: any[]) => arr.forEach(item => console.log(item)));
        list_up(rib_conf.ls({}) as any[]);

    }
};
