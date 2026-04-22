const showcase = () => {

    return `

// Showcase

// In this showcase, we demonstrate how to create your own command.

// First, import cmd_register.
// This interface ensures no required fields are missing when registering a command.

import type { cmd_register } from '../../src/logics/forms/interface.ts'
import rib_api from '../../src/api/api-hub.ts'

// During Ribbon command registration, export default is used to define the registration form.
// Any declarations should be defined outside of export default.

// In the form, we have these fields:
// @param command: string - command name
// @param alias: string[] | string - command alias
// @param argument: string[] - command arguments
// @param options: { option: string, desc?: string }[] - command options
// @param desc: string - command description
// @param action: (...args: any[]) => void - command action

// You can check the meaning of each field by reading Commander's README on npm.

// Here is an example to output logs.

const test_log = (name: string) => {
    console.log(\`welcome to ribbon \${name} showcase!\`)
}

export default {
    command: 'showcase',
    alias: 'sc',
    argument: [
        '<name>'
    ],
    desc: 'showcase ribbon command',
    action: (name: string) => {
        test_log(name)
    }
} satisfies cmd_register

// Let's try to run this command:
// Open your terminal and input "rib run showcase [your name]"

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

export default {
    showcase,
    template
}