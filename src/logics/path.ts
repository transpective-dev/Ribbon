import appRoot from 'app-root-path'
import path from 'path'

const root = appRoot.path;

// dont forget to delete src when publish
const usr = path.join(root, 'src', 'usr');
const usr_config = path.join(usr, 'config.json');
const usr_command = path.join(usr, 'registered.json');
const alias_pack = path.join(usr, 'alias_pack');
const extension = path.join(usr, 'extension');
const schemas = (targetDir: string = usr) => {
    return path.join(targetDir, '_rib_alias', 'schema.json');
};

const paths = {
    usr,
    usr_config,
    usr_command,
    alias_pack,
    extension,
}

import fs from 'fs-extra';

export const init_path = async () => {

    const ls = Object.values(paths)

    for (const i of ls) {

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

await init_path();

export const write_schema = (path: any, schema: any) => {
    console.log('writing...')
    fs.outputJSONSync(schemas(path), schema, { spaces: 2 });
}

export default {
    root,
    usr,
    paths,
    usr_config,
    usr_command,
    write_schema
}