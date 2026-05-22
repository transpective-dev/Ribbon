import { srv, acc_expiry as acc } from './keys.ts'
import keytar from 'keytar'
import crypto from 'crypto-js'
import fs from 'fs-extra'
import { type Cache, cache as cacheSchema } from './schema.ts'
import _path from '../src/logics/utils/path.ts'

interface cacher_returnType
{
	state: boolean,
	data?: string | Cache
}

class CacheManager
{

	private cacher: {
		get: () => cacher_returnType,
		set: () => cacher_returnType
	} = {
			get: () =>
			{
				try {

					const res = fs.readJSONSync(_path.paths.cache_json)

					const safeParsing = cacheSchema.safeParse(res)

					if (!safeParsing.success) {
						throw new Error('Cache Structure Invalid. Please Rerun Login Command')
					}

					return {
						state: true,
						data: safeParsing.data
					}

				} catch (e) {

					return {
						state: false,
						data: e as string
					}

				}
			},
			set: () =>
			{
				try {

					fs.writeJSONSync(_path.paths.cache_json, this.cache)

					return {
						state: true
					}

				} catch (e) {

					return {
						state: false,
						data: e as string
					}

				}
			}
		}

	private cache: Cache

	private key: string

	constructor(key: string)
	{

		// initialize cache
		const getCache = this.cacher.get();

		// don't forget to use try...catch to capture it.
		if (!getCache.state) throw Error('Cache fetching failed. Please ensure file exists');

		this.cache = getCache.data as Cache;

		this.key = key

	}


	private generateTime = async () =>
	{

		const current = Date.now()

		const expiry_time = current + 1 * 60 * 1000

		const encrypted = crypto.HmacSHA256(expiry_time.toString(), this.key!).toString()

		await keytar.setPassword(srv, acc, encrypted)

		if (this.cache.expiry_time === null) {

			this.cache.expiry_time = expiry_time

			this.cacher.set()

		}

	}

	// check did expiry time manipulated.
	validateTime = async (): Promise<boolean> =>
	{

		const { expiry_time } = this.cache as Cache

		let res: boolean = false

		if (expiry_time) {

			const encrypted = crypto.HmacSHA256(expiry_time.toString(), this.key!).toString()

			res = encrypted === await keytar.getPassword(srv, acc)

		}


		if (!res) {

			await this.reset();

		}

		return this.isExpired()


	}

	isExpired = async () =>
	{

		const current = Date.now();

		const { expiry_time } = this.cache as Cache

		if (expiry_time && current < expiry_time) {


			return false

		}

		await this.reset();

		return true

	}

	login = async () =>
	{
		if (this.cache && this.cache.expiry_time === null) {
			await this.generateTime()
		}
	}

	reset = async () =>
	{

		this.cache.expiry_time = null;

		this.cacher.set();

		await keytar.deletePassword(srv, acc);

	}


}

import { general_encrypt_key } from './keys.ts'

export const cacheManager = (() =>
{
	try {

		return new CacheManager(general_encrypt_key);

	} catch (e) {

		return undefined
	}
})()