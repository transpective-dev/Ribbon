import Conf from 'conf';
import _schema from './templates/schema.ts'
import { type t_command_schema, type t_config_schema } from './templates/schema.ts';
import schemas from './templates/schema.ts'
import path from './path.ts';
import _init from './templates/cfg_init.ts';
import { colored_prefix } from './utils/color.ts';
import chalk from 'chalk';
import { pallete } from './utils/color.ts';
import { system_init } from './templates/alias_init.ts';
import { _parse } from 'zod/v4/core';
import fs from 'fs-extra';
import crypto from 'crypto-js';
import { general_encrypt_key } from '../../control/.usr_utils/encryption_utils.ts';
import { PassThrough } from 'node:stream';

const platform = process.platform;

class RibbonConfig
{

	private config: {

		command: Conf<t_command_schema>

		config: Conf<t_config_schema>
	};

	toggle<key extends keyof t_config_schema['settings']>(key: key)
	{

		const settings = this.all('config').settings as t_config_schema['settings'];

		const prev: boolean = settings[key] as boolean;

		settings[key] = !settings[key];

		this.config.config.set('settings', settings);

		const isTrue = (val: boolean) =>
		{
			return val ? chalk.hex(pallete.green_alt)('true') : chalk.hex(pallete.red)('false');
		}

		console.log(`\n${key}: `)
		console.log('-'.repeat(20))
		console.log(`${isTrue(prev)} → ${isTrue(settings[key])}\n`)



	}

	load()
	{

		// create cache
		(() =>
		{

			try {

				const read = {
					cmd: fs.readFileSync(path.usr_command).toString(),
					cfg: fs.readFileSync(path.usr_config).toString(),
					checksum: fs.readJSONSync(path.paths.checksum)
				}

				if (crypto.SHA256(read.cmd).toString() != read.checksum.cmd) {
					throw new Error()
				}
				
				if (crypto.SHA256(read.cfg).toString() != read.checksum.cfg) {
					throw new Error()
				}

				const cmdDecrypted = crypto.AES.decrypt(read.cmd, general_encrypt_key).toString(crypto.enc.Utf8);
				const cfgDecrypted = crypto.AES.decrypt(read.cfg, general_encrypt_key).toString(crypto.enc.Utf8);

				fs.writeJSONSync(path.u_cmd_cache, JSON.parse(cmdDecrypted), { spaces: 2 });
				fs.writeJSONSync(path.u_cfg_cache, JSON.parse(cfgDecrypted), { spaces: 2 });

			} catch (_) {

				console.log('File is damaged. initializing files...')

				if (fs.existsSync(path.usr_command)) {
					fs.removeSync(path.usr_command)
				}

				if (fs.existsSync(path.usr_config)) {
					fs.removeSync(path.usr_config)
				}

				if (fs.existsSync(path.u_cmd_cache)) {
					fs.removeSync(path.u_cmd_cache)
				}

				if (fs.existsSync(path.u_cfg_cache)) {
					fs.removeSync(path.u_cfg_cache)
				}

				this.init();

			}


		})();

		const command_config = () =>
		{
			const i = path.u_cmd_cache.split(/[\/\\]+/)
			const [filename, filepath] = [i.pop()?.replace('.json', ''), i.join('/')]
			return {
				configName: filename!,
				cwd: filepath
			}
		}

		const config_config = () =>
		{
			const i = path.u_cfg_cache.split(/[\/\\]+/)
			const [filename, filepath] = [i.pop()?.replace('.json', ''), i.join('/')]
			return {
				configName: filename!,
				cwd: filepath
			}
		}

		return {

			command: new Conf<t_command_schema>(
				command_config()
			),

			config: new Conf<t_config_schema>(
				config_config()
			)

		};


	}

	init()
	{

		const encrypted = {
			cmd: crypto.AES.encrypt(JSON.stringify(system_init), general_encrypt_key).toString(),
			cfg: crypto.AES.encrypt(JSON.stringify(schemas.config_schema.parse({})), general_encrypt_key).toString()
		}

		if (!fs.existsSync(path.usr_command)) {
			fs.writeFileSync(path.usr_command, encrypted.cmd)
			fs.writeJSONSync(path.u_cmd_cache, system_init, { spaces: 2 })
		}

		const get_filter = (() =>
		{

			if (platform === 'win32') return _init.windows;
			if (platform === 'darwin') return _init.darwin;
			return _init.linux;

		})()

		const config_init = {
			filter: get_filter,
			settings: schemas.config_schema.parse({}).settings
		}

		if (!fs.existsSync(path.usr_config)) {
			fs.writeFileSync(path.usr_config, encrypted.cfg)
			fs.writeJSONSync(path.u_cfg_cache, config_init, { spaces: 2 })
		}

		fs.writeJSONSync(path.paths.checksum, {
			cfg: crypto.SHA256(fs.readFileSync(path.usr_config).toString()).toString(),
			cmd: crypto.SHA256(fs.readFileSync(path.usr_command).toString()).toString()
		}, { spaces: 2 })

	}

	constructor()
	{
		this.init()
		this.config = this.load()
	}

	allFlatCommands(): Record<string, any>
	{
		const store = this.config.command.store;
		let flattened: Record<string, any> = {};
		for (const [groupName, groupData] of Object.entries(store)) {
			for (const [key, value] of Object.entries(groupData as any)) {
				flattened[key] = { ...(value as any), _group: groupName };
			}
		}
		return flattened;
	}

	// find command
	find({ type, keywords, isMinified, group }: { type: string, keywords?: string, isMinified?: boolean, group?: string })
	{

		const entried = (() =>
		{

			// global 
			if (!group) {
				return Object.entries(this.allFlatCommands())
			}

			// group
			return Object.entries(this.config.command.get(group) || {});

		})()

		const _key_regex = keywords ? new RegExp(keywords, "i") : null

		const res = Object.fromEntries(

			entried.filter(([key, value]) =>
			{

				if (type === 'all') {

					if (!_key_regex) return true;

					// Global search across multiple fields
					const searchStr = `${key} ${value.id} ${value.abs} ${value.cmd} ${value.tags.join(' ')}`;

					return _key_regex.test(searchStr);

				}

				// filter by keywords if provided
				if (_key_regex) {

					// get matched field
					const fieldValue = (value as any)[type];

					// handle array case 
					if (Array.isArray(fieldValue)) {
						return fieldValue.some(i => _key_regex.test(i));
					}

					// handle other case
					return _key_regex.test(fieldValue as string);

				}

				// return all if no value provided
				return true;
			})

		);

		if (isMinified) {

			const arr: any[] = []

			Object.entries(res).forEach(([key, value]: any) =>
			{

				arr.push({
					id: value.id,
					alia: key,
					t: ' ' + (value.cmd.split(/<T:?\s?\w*>/).length - 1).toString(),
					abs: value.abs,
					time: value.time,
					group: value._group || 'unknown'
				});

			})

			return arr

		}

		return res

	}

	// register command
	// user only able to register in 'user' group
	register(key: string, value: any)
	{

		try {

			// check existence
			if (key in this.config.command.get('user')) return { status: false, msg: 'Command already exists in user' };

			// get user section 
			const userGroup = this.config.command.get('user') || {};

			this.config.command.set('user', { ...(userGroup as any), [key]: value });

			return { status: true, msg: 'Command registered successfully' }
		} catch (err) {
			return { status: false, msg: 'Command registration failed' }
		}

	}

	// delete command
	delete(key: string)
	{

		try {
			const store = this.config.command.store;
			let deleted = false;
			for (const [groupName, groupData] of Object.entries(store)) {
				if ((groupData as any)[key]) {
					const newGroup = { ...groupData as any } as any;
					delete newGroup[key];
					this.config.command.set(groupName as any, newGroup);
					deleted = true;
					break;
				}
			}
			return deleted ? { status: true, msg: 'Command deleted successfully' } : { status: false, msg: 'Command not found' };
		} catch (err) {
			return { status: false, msg: 'Command deletion failed' }
		}

	}


	all(type: 'command' | 'config', reload?: boolean)
	{

		return this.config[type].store;

	}

	// single 
	get(key: string)
	{
		if (!key) return null;

		const _key = key.trim()

		try {
			return this.config.command.get(_key);
		} catch (e: any) {
			console.log(colored_prefix.error + e.message);
			return null;
		}

	}


	set({
		key, value
	}: {
		key: string,
		value: t_command_schema[string]
	})
	{

		const list = this.config.command.store;

		list[key] = value;

		this.config.command.set(key, list);

		return
	}

	has(key: string)
	{
		return !!this.allFlatCommands()[key];
	}

	getConfig(key: keyof t_config_schema['settings'])
	{

		const settings = this.all('config').settings as t_config_schema['settings'];

		if (key in settings) {
			return settings[key];
		}

		return null;

	}

}

export const rib_conf = new RibbonConfig();

export const [command, config] = [rib_conf.all('command'), rib_conf.all('config')];