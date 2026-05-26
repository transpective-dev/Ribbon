import fs from 'fs-extra';
import path from 'path';

/**
 * Drop-in replacement for `conf` package.
 * Uses fs-extra (bundleable) instead of conf (not bundleable by bun --compile).
 */
export default class Conf<T extends Record<string, any> = Record<string, any>>
{
	private filePath: string;
	private data: T;

	constructor(opts: { configName: string; cwd: string; defaults?: Partial<T> })
	{
		this.filePath = path.join(opts.cwd, `${opts.configName}.json`);

		fs.ensureDirSync(opts.cwd);

		if (fs.existsSync(this.filePath)) {
			try {
				this.data = fs.readJSONSync(this.filePath);
			} catch {
				this.data = (opts.defaults ?? {}) as T;
				this.write();
			}
		} else {
			this.data = (opts.defaults ?? {}) as T;
			this.write();
		}
	}

	get store(): T
	{
		return this.data;
	}

	get<K extends keyof T>(key: K): T[K]
	{
		return this.data[key];
	}

	set<K extends keyof T>(key: K, value: T[K]): void
	{
		this.data[key] = value;
		this.write();
	}

	delete<K extends keyof T>(key: K): void
	{
		delete this.data[key];
		this.write();
	}

	has<K extends keyof T>(key: K): boolean
	{
		return key in this.data;
	}

	clear(): void
	{
		this.data = {} as T;
		this.write();
	}

	private write(): void
	{
		fs.writeJSONSync(this.filePath, this.data, { spaces: 2 });
	}
}
