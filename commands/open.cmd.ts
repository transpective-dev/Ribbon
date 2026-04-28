import type { cmd_register } from "../src/logics/templates/interface.ts";
import { spawnChild } from "../src/api/spawn.ts";
import { platform } from "../src/logics/env.ts";
import _path from "../src/logics/path.ts";

export default {
    command: "open",
    argument: ['<name>'],
    desc: "open system file",
    action: async (name: any) => {

        const p = platform;

        const cmd = () => {
            if (p === 'win') return 'start';
            if (p === 'mac') return 'open';
            if (p === 'lnx') return 'xdg-open';
        };

        const forRunning = async (path: string) => {
            try {

                await spawnChild(`${cmd()} "${path}"`);
                
            } catch (error) {
                
                console.log(error);
                
            }
        }

        switch (name) {
            case "config":
                return await forRunning(_path.usr_config);
            case 'alias':
                return await forRunning(_path.usr_command);
            default:
                console.log(`file not supported: ${name}`)
                break
        }
    }
} satisfies cmd_register;