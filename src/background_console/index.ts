import { spawn, type ChildProcess, exec } from 'child_process';
import dgram from 'dgram';
import path from 'path'
import * as url from "url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/* 
udp is abbreviation of User Datagram Protocol 

when we create socket, it will turn terminal window into a server.

parent process can send datagram to server. Then server will receive it and log it.
*/

class BackgroundConsole {
	public port: number | null = null;
	public client: dgram.Socket;
	private child: ChildProcess | null = null;
	private pid: number | undefined = undefined;

	// Use a static method to handle the async setup
	static async create() {
		const instance = new BackgroundConsole();
		await instance.setup();
		return instance;
	}

	constructor() {
		this.client = dgram.createSocket('udp4');
	}

	private async setup() {

		this.port = await this.findAvailablePort();

		const socket_path = path.join(__dirname, 'socket.ts');

		process.env.BACK_LOADER_PORT = this.port.toString();

		// Pass the port to the child process so it knows where to bind
		this.child = spawn('cmd.exe', ['/k', `bun run "${socket_path}" ${this.port}`], {
			shell: true,
			detached: true,
			stdio: 'ignore'
		});

		this.pid = this.child.pid;

		this.child.unref();
	}

	private findAvailablePort(): Promise<number> {
		return new Promise((resolve) => {
			const tryRandom = () => {
				const port = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
				const socket = dgram.createSocket('udp4');

				socket.once('error', () => {
					socket.close();
					tryRandom(); // If busy, try again
				});

				socket.once('listening', () => {
					socket.close();
					resolve(port); // Found one!
				});

				socket.bind(port);
			};
			tryRandom();
		});
	}

	log(message: Buffer | string) {

		if (!this.port) return;
		const buf = Buffer.from(message);
		this.client.send(buf, this.port, 'localhost');

	}

	kill() {
		if (this.child && this.child.pid) {
			this.child.kill();
			this.child = null;
		}
	}
}

export default {
	backlander: async ({
		dispose
	}: {
		dispose: 'auto' | 'manual'
	}) => {
		const i = await BackgroundConsole.create()

		//  log output failure due to initialization delay
		await new Promise((resolve) => {
			setTimeout(() => {
				resolve(true);
			}, 3000)
		});

		if (dispose === 'auto') {
			process.on('exit', () => {
				i.kill();
			});
		}

		return i;
	}
}
