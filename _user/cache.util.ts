import { type Cache, cache } from "./_user.interface.ts"
import Conf from "conf"
import crypto, { enc } from 'crypto-js'
import { general_encrypt_key } from "./keys.ts";
import _path from "../src/logics/utils/path.ts";
import fs from "fs-extra";
import { extend } from "zod/mini";

new Conf<Cache>({
	configName: 'cache',
	cwd: _path.paths.cache,
	defaults: {
		default: null,
		expiry_time: null
	}
})

export const getLoginState = () =>
{

	const res = fs.readFileSync(_path.paths.state, 'utf-8')
	fs.removeSync(_path.paths.state)
	return res

}

export const cipher = {
	enc: (data: string) =>
	{
		return crypto.AES.encrypt(data, general_encrypt_key).toString()
	},
	dec: (data: string) =>
	{
		return crypto.AES.decrypt(data, general_encrypt_key).toString(crypto.enc.Utf8)
	},
	f_enc: (data: string, target: string) =>
	{

		if (!target) {
			return console.log('target path is required')
		}

		fs.writeFileSync(target, cipher.enc(data));

	},
	f_dec: (original: string, target: string) =>
	{

		if (!target) {
			return console.log('target path is required')
		}

		const isJSON = target.endsWith('.json')

		const data = fs.readFileSync(original, 'utf-8');

		if (isJSON) {
			return fs.writeJSONSync(target, JSON.parse(cipher.dec(data)), { spaces: 2 })
		}

		return fs.writeFileSync(target, cipher.dec(data));

	}
}