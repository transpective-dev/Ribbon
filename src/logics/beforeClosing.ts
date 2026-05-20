import _path from './path.ts'
import fs from "fs-extra"
import crypto from 'crypto-js'
import { general_encrypt_key } from '../../control/.usr_utils/encryption_utils.ts'

const task_queue: (() => void)[] = []

task_queue.push(() =>
{

	const { u_cfg_cache, u_cmd_cache, usr_command, usr_config } = _path
	const { checksum } = _path.paths

	const rawdata = {
		cfg: fs.readJSONSync(u_cfg_cache),
		cmd: fs.readJSONSync(u_cmd_cache)
	}

	const encrypted = {
		cmd: crypto.AES.encrypt(JSON.stringify(rawdata.cmd), general_encrypt_key).toString(),
		cfg: crypto.AES.encrypt(JSON.stringify(rawdata.cfg), general_encrypt_key).toString()
	}

	fs.writeFileSync(usr_command, encrypted.cmd);
	fs.writeFileSync(usr_config, encrypted.cfg);

	fs.removeSync(u_cfg_cache)
	fs.removeSync(u_cmd_cache)

	const get_checksum = {
		cfg: crypto.SHA256(fs.readFileSync(usr_config).toString()).toString(),
		cmd: crypto.SHA256(fs.readFileSync(usr_command).toString()).toString()
	}

	fs.writeJSONSync(checksum, get_checksum, { spaces: 2 });

})

process.on('exit', (code) =>
{
	task_queue.forEach((task) => task());
});
