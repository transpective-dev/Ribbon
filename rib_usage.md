# what is ribbon ?

ribbon is a alias tool for terminal.

command prefix is 'rib'

# command list

in rib, we support following commands

- regis/add: register new command macro into json
- exec/run: run saved command
- del: delete command macro
- find: find command macro
- ls: list all commands
- config: configurate ribbon settings

you can check specific command usage by input "rib" or "rib help [command_name]" in terminal.

# command usage

### add 

command: rib add <name>="<command>" [options]

<name>: alias for command

<command>: command template {
    Slot System:
    - <T>: basic slot (any value)
    - <T: string|number|boolean>: typed slot (auto-check & auto-quotes for strings)
    - <T>(fallback): default value slot
    - <T: type>(fallback): typed slot with fallback
    Note: 
    - Slots are filled sequentially by "rib run <name> [args]"
    - Priority Filling: Required slots are filled first; surpluses overflow to default slots
    - On Windows, use single quotes ('') for the template to prevent shell interference
}

[options]:
-t: <value>: tag of command. format: "tag1,tag2,tag3,..." we'll separate it by "," into array.
-a: <value>: abstract of command
-d: <value>: description of command

example:
rib add rg='rg -t <T: string>(hello) <T: string>'

### run / exec

command: rib run <name> [args...] [options]

<name>: alias to run

[args...]: values for <T> slots (ordered)

[options]:
-d: direct execute shell cmd. format: <cmd_to_run> -d
-s: run ts script from usr/scripts. format: <script_name> -s

example: rib run rg "hello" "."

### del

command: rib del <name>

<name>: alias to delete

example: rib del rg

### find

command: rib find <keyword> [options]

<keyword>: search term

[options]:
-t <type>: target (tag, cmd, desc, id, all)
-g <name>: filter by group
-m: minified view

example: rib find "git" -t tag

### ls

command: rib ls [options]

[options]:
-f: full json output (not minified)

example: rib ls -f

### config

command: rib config [options]
[options]:
-l: interactive config UI
-t <key>: toggle boolean setting (e.g., useShell, showMacro)

example: rib config -t useShell


## note
- ls and find -t all is not good for AI. because it takes too much tokens to read. prefer using specified searches.


## configs

alwaysRejectExecution: {
     init: true, 
     desc: "Auto-reject dangerous commands without prompting." 
}
askBeforeDelete: {
     init: true, 
     desc: "Confirmation prompt before macro removal." 
}
showMacro: {
     init: true, 
     desc: "Visual highlighting of destructive keywords in console." 
}
appendDQWhenTString: {
     init: true, 
     desc: "Auto-wrap string slot values in double quotes." 
}
useShell: {
     init: false, 
     desc: "Use PowerShell instead of CMD (Windows only)." 
}

### advanced

enableSlotFilling: {
     init: true, 
     desc: "Slot Shifting logic. Plain slots have higher priority than default slots. Required fields are filled first; surpluses overflow to defaults." 
}

asking:
whenTypeMissing: {
     init: true, 
     desc: "Prompt for missing required arguments." 
}
whenTypeNotMatched: {
     init: true, 
     desc: "Interactively fix type mismatches." 
}
