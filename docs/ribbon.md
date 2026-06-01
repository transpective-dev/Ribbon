## Contents

- [What is ribbon?](#what-is-ribbon)
- [Commands](#commands)
  - [register](#register)
  - [find](#find)
  - [exec](#exec)
  - [discard](#discard)
  - [cfg](#cfg)
- [Advanced](#advanced)
  - [Slot Filling](#slot-filling)
  - [Execution Guard](#execution-guard)

## What is Ribbon?

Ribbon is a for agent to make some actions.

For example, register new command macro, find alternative macro of rejected command, etc.

## Commands

### register

`register` command is for registering new command macro.

command macro is like a MCP server but simpler.

here is an example of command macro

```typescript
commit: {
	id: 520A2A,
	time: -,
	desc: "commit and push",
	cmd: "git add . && git commit -m 'auto-commit' && git push",
	safeRun: true
}

```

**significant fields** :

`desc` : description of command set. to explain what this command can do.

`cmd` : the commands you want to execute.

`safeRun` :

_true_ means this command is verified by user or no keyword hooked.

_false_ means execution-guard detected keyword.

**Syntax** :

`rib register/rgs/add <i> -d <value> `

`<i>` : syntax = `name='[cmd]'`. Note that the command must be enclosed in single quotes.

`-d <value>` : optional. description for command macro.

---

### find

`find` command is for finding command macro.

**Syntax** :

`rib find [value] -t <type>`

`[value]` : optional. input keywords. use `type: all` as default if no `-t` provided.

`-t <type>` : optional. select search type.

| Support type | Description                |
| ------------ | -------------------------- |
| all          | search all fields and name |
| id           | search by id               |
| time         | search by time             |
| desc         | search by description      |
| cmd          | search by command          |
| safeRun      | search by safeRun          |

---

### exec

`exec` command is for executing command macro.

**Syntax** : 

`rib exec <i...> -d -s`

`<i...>` : i[0] = alias of macro, i[1...] = slot value.

`-d` : run command directly. `<i...>` will be joined by space and run as a command. for debugging execution-guard or other logic without macro registration.

`-s` : run script. the first elem of `<i...>` will be recognize as script name, and the rest will be discarded. not recommended to use for now.

*why?* : 
- Security logic is not implemented yet.

**How to use Script** : 

1. create `.script.ts` file and write your script.

2. run by `rib exec <filename> -s`

---

### discard 

`discard` command for removing command macro.

**Syntax** :

`rib discard <i>`

`<i>` : alias of macro.

---

### cfg

`cfg` command is for configuring ribbon.

**Syntax** :

`rib cfg -s -t <key>`

`-s` : optional. show all config

`-t <key>` : optional. toggle state of key.

|Key| Enabled | Disabled | 
| :-: | :-: | :-: |
| showMacro | show macro | hide macro | 
| appendDQwhenTString | when slot has type `string`, value will be enclosed in double quotes. | raw | 
| enableSlotFilling | enable smart slot filling system | slot filling in order (from left to right) | 
| useShell | `windows: poweshell.exe`, `linux/mac: bash` | true | 
| smartShell | use most suitable bin to execute command | use `useShell` option | 
| rigid | require both `token` and `safeRun` to execute command | `safeRun` is only required | 
| safeRunAutoChange | enable : `execution-guard` result will be the state of `safeRun` | disable : `safeRun` is always `false` | 

---



