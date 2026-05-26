import path from 'path'

const root = process.env.GET_ROOT || '';

// need init
const misc = path.join(root, 'misc');
const usr_config = path.join(misc, 'config.enc');
const usr_command = path.join(misc, 'macro.enc');
const checksum = path.join(misc, 'checksum.json');
const scripts = path.join(misc, 'scripts');
const commands = path.join(misc, 'commands');

// cache
const cache = path.join(root, '.cache');
const cache_json = path.join(cache, 'cache.json');
const u_cfg_cache = path.join(cache, 'config.cache.json');
const u_cmd_cache = path.join(cache, 'macro.cache.json');
const state = path.join(cache, '.state');

const paths = {
	misc,
	scripts,
	commands,
	cache,
	cache_json,
	state,
	checksum
}

const dev = {
	misc,
	cache,
}

import fs from "fs-extra";

export const init_path = async () =>
{

	const ls = process.env.GET_ROOT?.endsWith('.exe') ? Object.values(paths) : Object.values(dev)

	for (const i of ls) {

		let t: 'folder' | 'file' | undefined = undefined

		const suffix = ['.json', '.js', '.ts']

		if (suffix.some((s) => i.endsWith(s))) {
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

export default {
	root,
	misc,
	paths,
	usr_config,
	usr_command,
	u_cfg_cache,
	u_cmd_cache
}