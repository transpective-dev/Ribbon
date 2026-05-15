import { srv, acc_expiry as acc } from './share.ts'
import keytar from 'keytar'
import crypto from 'crypto-js'
import fs from 'fs-extra'
import { type Cache, cache as cacheSchema } from '../schema.ts'
import _path from '../../src/logics/path.ts'

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

	private cache: Cache | null = null

	private key: string | null = null

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

		const expiry_time = current + 5 * 60 * 1000

		const encrypted = crypto.HmacSHA256(expiry_time.toString(), this.key!).toString()

		await keytar.setPassword(srv, acc, encrypted)

		if (this.cache?.expiry_time === null) {

			this.cache.expiry_time = expiry_time

			this.cacher.set()

		}

	}

	private validateTime = async () =>
	{

		const { expiry_time } = this.cache as Cache

		const encrypted = crypto.HmacSHA256(expiry_time!.toString(), this.key!).toString()

		return encrypted === await keytar.getPassword(srv, acc)

	}

	isExpired = () =>
	{

		const current = Date.now();

		const { expiry_time } = this.cache as Cache

		if (expiry_time && current > expiry_time && this.cache) {

			this.cache.expiry_time = null

			this.cacher.set()

			return true

		}

		return false

	}

	resetter = async (): Promise<boolean> =>
	{

		const res = await this.validateTime()

		if (!res) {

			console.log('Expiry Time Manipulated.')

			return false

		}

		if (this.isExpired() && this.cache) {


			await this.generateTime()

			return true

		}

		return false

	}


}

export const cacheManager = (key: string) =>
{
	try {

		return new CacheManager(key);

	} catch (e) {

		return undefined
	}
}