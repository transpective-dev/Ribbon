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
            case 'schema':
                try {

                    const create = await prompt({
                        type: 'input',
                        name: 'create',
                        message: 'Enter group name: ',
                        initial: path.root
                    })

                    if ('create' in create) {

                        console.log(create.create)
                        create_schema(create.create);
                        console.log('Schema created successfully')

                    }

                } catch (e: any) {
                    console.log('Failed to create schema')
                    console.log(e)
                }
                break;
            default:
                console.log('invalid type')
                break;
        }

    }
}

import { write_schema } from '../path.ts';

const create_schema = (path: any) => {
    // zod-to-json-schema currently fails with Zod v4, so we construct the schema manually for now
    const jsonSchema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        additionalProperties: {
            type: "object",
            additionalProperties: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    time: { type: "string" },
                    abs: { type: "string" },
                    desc: { type: "string" },
                    cmd: { type: "string" },
                    tags: { type: "array", items: { type: "string" }, default: [] }
                },
                required: ["abs", "cmd", "desc"]
            }
        }
    };

    write_schema(path, jsonSchema);

};