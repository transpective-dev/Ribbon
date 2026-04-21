const showcase = () => {

    return `

// showcase 

// in this showcase, we will demonstrate how to create your own command.

// first, we need to import cmd_register.
// this interface can make sure there is no missing terms for register command

import type { cmd_register } from '../../src/logics/forms/interface.ts'
import rib_api from '../../src/api/api-hub.ts'

// at ribbon command registeration, export default is for putting register_form.
// any declarations are should be defined at outside of export default.

// in form, we have these fields.
// @param command: string - command name
// @param alias: string[] | string - command alias
// @param argument: string[] - command argument
// @param options: { option: string, desc?: string }[] - command options
// @param desc: string - command description
// @param action: (...args: any[]) => void - command action

// you can check meaning of each field by reading commander's readme at npm.

// here is example to output log.

const test_log = () => {
    console.log('here is ribbon showcase!')
}

export default {
    command: 'showcase',
    alias: 'sc',
    argument: [],
    options: [],
    desc: 'my command description',
    action: () => {
        console.log('hello from my command')
    }
} satisfies cmd_register
    
    `
}

const template = `

import type { cmd_register } from '../../src/logics/forms/interface.ts'
import rib_api from '../../src/api/api-hub.ts'

export default {
    command: 'my-command',
    desc: 'my command description',
    action: () => {
        console.log('hello from my command')
    }
} satisfies cmd_register

`
