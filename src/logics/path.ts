import appRoot from 'app-root-path'
import path from 'path'

const root = appRoot.path;
const usr = path.join(root, 'src', 'usr');
const usr_config = path.join(usr, 'config.json');
const usr_command = path.join(usr, 'registered.json');

export default {
    root,
    usr,
    usr_config,
    usr_command
}