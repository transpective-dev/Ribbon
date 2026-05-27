import _path from './utils/path.ts'
import fs from "fs-extra"
import crypto from 'crypto-js'
import { general_encrypt_key } from '../../_user/keys.ts'
import { write } from 'fs'

const task_queue: (() => void)[] = []

const { u_cfg_cache, u_cmd_cache, usr_command, usr_config } = _path
const { checksum } = _path.paths

// Strict type derived from file_types — enforces key consistency across rawdata / encrypted / checksum
type FileType = {
	name: 'cmd' | 'cfg',
	read: string,  // cache path (source)
	write: string  // enc path (destination)
}

type FileKey = FileType['name']
type NullableRecord = Record<FileKey, string | null>
type ChecksumRecord = Record<FileKey, string>

const file_types: FileType[] = [
	{ name: 'cmd', read: u_cmd_cache, write: usr_command },
	{ name: 'cfg', read: u_cfg_cache, write: usr_config  },
]

task_queue.push(() =>
{

	// 1. read each cache; return null if file does not exist
	const rawdata = Object.fromEntries(
		file_types.map(({ name, read }) =>
		{
			try {
				return [name, fs.readJSONSync(read)]
			} catch (_) {
				return [name, null]
			}
		})
	) as NullableRecord

	// load existing checksum as fallback for null entries
	const before: ChecksumRecord = (() =>
	{
		try {
			return fs.readJSONSync(checksum)
		} catch (_) {
			return { cmd: '', cfg: '' }
		}
	})()

	// 2. encrypt only non-null entries; null -> keep as null
	const encrypted = Object.fromEntries(
		file_types.map(({ name }) =>
		{
			const data = rawdata[name]
			if (data === null) return [name, null]
			return [name, crypto.AES.encrypt(JSON.stringify(data), general_encrypt_key).toString()]
		})
	) as NullableRecord

	// 3. write only non-null encrypted values
	file_types.forEach(({ name, write }) =>
	{
		const enc = encrypted[name]
		if (enc !== null) {
			fs.writeFileSync(write, enc)
		}
	})

	// 4. delete all cache files (read paths)
	cleanFiles();

	// 5. build checksum: use fresh hash if written, else fall back to before
	const get_checksum: ChecksumRecord = Object.fromEntries(
		file_types.map(({ name, write }) =>
		{
			if (encrypted[name] === null) {
				return [name, before[name]]
			}
			return [name, crypto.SHA256(fs.readFileSync(write).toString()).toString()]
		})
	) as ChecksumRecord

	fs.writeJSONSync(checksum, get_checksum, { spaces: 2 });

});

export const cleanFiles = () => {

	file_types.forEach(({ read, write }) =>
	{
		fs.removeSync(read)

	})

}

process.on('exit', (_) =>
{
	task_queue.forEach((task) => task());
});

