#!/usr/bin/env node
import dgram from 'dgram';
const server = dgram.createSocket('udp4');

const port = process.env.BACK_LOADER_PORT;

server.on('message', (msg: any) => {
    process.stdout.write(`\r\n\x1b[94m[${new Date().toLocaleString()}]:\x1b[0m ${msg}`);
});

server.on('listening', () => {
    console.log(`BACK_LOADER_PORT: ${port}...`);
});

server.bind(Number(port));
