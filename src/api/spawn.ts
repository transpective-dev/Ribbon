import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { EventEmitter } from 'events';
import iconv from 'iconv-lite';
import { rib_conf } from "../logics/manage.ts";

const isWindows = process.platform === 'win32';
const shellStatus = () => {
    const isEnabled = rib_conf.all('config').settings.useShell;
    if (isEnabled) {
        return isWindows ? 'powershell.exe' : '/bin/bash';
    }
    return true;
}

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
                shell: shellStatus(),
                stdio: 'pipe',
            });

            const toString = (data: Buffer) => {
                return isWindows ? iconv.decode(data, 'gbk') : data.toString();
            }

            this.child.stdout?.on('data', (data) => {

                data = toString(data);

                if (this.showInConsole) {
                    process.stdout.write(data);
                }

                this.emit.emit('stdout', data);
            });

            this.child.stderr?.on('data', (data) => {

                data = toString(data);

                if (this.showInConsole) {
                    process.stderr.write(data);
                }

                this.emit.emit('stderr', data);
            });

            this.child.on('exit', (code) => {
                this.emit.emit('exit', code);
                resolve(code)
            });

            this.child.on('error', (err) => {
                resolve(1)
            });

        })

    }

}

// private

export const spawnChild = (cmd: string) => {

    return new Promise((resolve, reject) => {

        const kill = (status: boolean) => {
            child.kill();
            status ? resolve(true) : reject(false)
        }

        const child = spawn(cmd, {
            shell: shellStatus(),
            stdio: 'inherit',
        });

        child.on('exit', (code) => {
            code === 0 ? kill(true) : kill(false)
        });

        child.on('error', (err) => {
            kill(false)
        });

    })
}