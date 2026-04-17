import fs from 'fs-extra'
import _path from '../path.ts'
import { file } from 'zod'

export default {
    command: 'import',
    argument: [
        '<type>'
    ],
    options: [
        { option: '-p, --path <value>', desc: 'Path to the command' },
    ],
    desc: 'Import a command',
    action: (type: string, options: any) => {

        switch (type) {

            case 'alias':

                // if path provided, then import from path. 
                // otherwise, get from default

                let path: string | null = null

                if (options.path && options.path.match(/\.[^.]+$/)) {
                    return console.log('error: path must be a directory')
                }

                if (options.path) {
                    path = options.path
                } else {
                    path = _path.schemas()._rib_alia
                }

                if (!path) {
                    return console.log('error: path not found')
                }

                const files = fs.readdirSync(path, { encoding: 'utf-8' }).map((file) => {

                    if (file.endsWith('.rib.json')) {
                        return file
                    }

                })

                if (files.length === 0) {
                    return console.log('No .rib.json found')
                }

                console.log('\nAvailable files: ')

                files.forEach((file) => {
                    console.log('- ' + file)
                })

                console.log('\n start importing...')

                break;
        }
    }
}