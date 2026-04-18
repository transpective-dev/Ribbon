// for creating something. like schema and temp

import enquirer from 'enquirer'
const { prompt } = enquirer
import path from "../path.ts";

export default {
    command: 'create',
    desc: 'create something',
    argument: [
        '<type>'
    ],
    action: async (type: any, options: any) => {

        switch (type) {
        }

        console.log('implementing...')

    }
}