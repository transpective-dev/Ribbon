import { rib_conf } from "../src/logics/manage.ts";
import utils from "../src/logics/utils/utils.ts";
import al from "../src/async_loader.ts"

// @ts-ignore
const { prompt } = al

export default {
    command: 'del',
    argument: [
        '<name>'
    ],
    desc: 'Delete a command',
    action: async (name: any) => {

        const config = rib_conf.all('config') as any;
        const ask = 'askBeforeDelete' in config.settings ? config.settings.askBeforeDelete : true;

        if (ask) {

            const askObj = {
                type: 'select',
                name: 'ask',
                message: 'Are you sure you want to delete this command?',
                choices: [
                    'yes',
                    'no'
                ]
            };

            (() => {
                if (config.settings.showMacro) {
                    return [...utils.log_formatter('Command to delete: ', rib_conf.get({ key: name }))];
                }
            })();

            const res = await prompt(askObj)

            if ('ask' in res && (res as any).ask === 'no') {
                return console.log('Deletion cancelled')
            }

        }

        const res = rib_conf.delete(name);

        if (res.status) {
            console.log(`Command deleted successfully: ${name}`);
        } else {
            console.log(`Command deletion failed: ${res.msg}`);
        }

    }
}