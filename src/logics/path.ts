import appRoot from 'app-root-path'
import path from 'path'

const root = appRoot.path;

// dont forget to delete src when publish
const usr = path.join(root, 'src', 'usr');
const usr_config = path.join(usr, 'config.json');
const usr_command = path.join(usr, 'registered.json');
const alias_pack = path.join(usr, 'alias_pack');
const extension = path.join(usr, 'extension');

const init_ls = [
    usr,
    usr_config,
    usr_command,
    alias_pack,
    extension
]

export default {
    root,
    usr,
    usr_config,
    usr_command
}

import * as fs from 'fs-extra';

export const init_path = async () => {

    for (const i of init_ls) {

        let t: 'folder' | 'file' | undefined = undefined

        if (i.match(/\.[^.]+$/)) {
            t = 'file'
        } else {
            t = 'folder'
        }

        if (t === 'folder') {
            await fs.ensureDir(i)
        }

        if (t === 'file') {
            await fs.ensureFile(i)
        }
    }
}