const showcase = (platform: 'win' | 'linux') => {

return `

// Showcase 

// import api from this relative path.
// you can change the name as you want.
import rib_api from '../../src/api/api-hub.ts'

// in this showcase, we use spawn.
// spawn_api is makes you able to spawn a process and run commands.
// if you are js programmer, you can import spawn from child_process. 
// and do more fancy things.

const { spawn } = rib_api

// how to use spawn ?

/* there is several method we provided.
1. get: you can get instance and call inside functions
2. dispose: when you don't need this instance anymore, you can dispose it to avoid memory leaks.
3. onStdout/onStderr: you can listen strout and stderr dynamically. 
4. when: if you are not good at js-coding, you can use this mothod to take some easy actions. we will demonstrate it later.
5. run: you can run command here.
6. log: every log we've catched. you can do more complex task with this.
*/

// example

// first, we are going to destructure the spawn
// although we can call it like a method, but destructuring is more clean visually.

const spawn_a = spawn() 

const { get, dispose, onStdout, onStderr, run } = spawn_a

// create your command set

const commandSet = [
'echo hello world',
${platform === 'win' ? '\'Write-Error "Something went wrong"\'' : 'echo "Error message" >&2'},
'sleep 3',
'echo after sleep'
]

// start running command set

for (const i in commandSet) {

    const cmd = commandSet[i]!

    console.log('hello from index ', i)

    let exit: boolean = false

    // Run your command and watch specific logs elegantly

    // structure: cmd, watch, useExecutionGuard(optional. default is true) 
    await run(cmd, [
        {
            type: 'stdout',
            satisfied: { includes: 'hello' },
            action: () => console.log('Got hello')
        },
        {
            type: 'stderr',
            satisfied: { includes: /error/gi },
            action: (data, stop) => {
                console.log('Got error')
                exit = true
                stop() // immediately abort the running process
            }
        }
    ], true);

    if (exit) {
        console.log('you wont see "after sleep"')
        break
    }

}

dispose()

// you also can write a function and run commands inside
const template = () => {
    // command to run
}

// you can IFE it self or call at here
(() => {
    template()
})()

    `

}

const template = `
import rib_api from '../../src/api/api-hub.ts'

const template = () => {
}

(() => {
    template()
})()
    
`

export default {
    showcase,
    template
}