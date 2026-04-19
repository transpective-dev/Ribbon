import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { EventEmitter } from 'events';

export class Spawn {

    public emit = new EventEmitter();

    public child: ChildProcess | null = null;

    public kill = () => {
        this.child?.kill();
    }

    private showInConsole: boolean;

    constructor(showInConsole: boolean = true) {
        this.showInConsole = showInConsole;
    }

    public spawn = (cmd: string) => {

        return new Promise((resolve, reject) => {

            this.child = spawn(cmd, {
                shell: true,
                stdio: 'pipe',
            });

            this.child.stdout?.on('data', (data) => {

                data = data.toString();

                if (this.showInConsole) {
                    process.stdout.write(data);
                }

                this.emit.emit('stdout', data);
            });

            this.child.stderr?.on('data', (data) => {

                data = data.toString();

                if (this.showInConsole) {
                    process.stderr.write(data);
                }

                this.emit.emit('stderr', data);
            });

            this.child.on('exit', (code) => {
                code === 0 ? resolve(true) : reject(false)
                this.kill()
            });

            this.child.on('error', (err) => {
                reject(false)
                this.kill()
            });

        })

    }

}

// // events.ts (共享文件)
// import { EventEmitter } from 'events';
// export const bus = new EventEmitter();

// // main-pipe.ts (处理 Pipe 的文件)
// child.stdout.on('data', (data) => {
//     const msg = data.toString();
//     bus.emit('new-log', msg); // 发射信号
// });

// // logger.ts (另一个文件)
// import { bus } from './events';
// bus.on('new-log', (msg) => {
//     console.log('监控到新日志:', msg);
// });
