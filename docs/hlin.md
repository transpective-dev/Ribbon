## Contents
- [What is hlin?](#what-is-hlin)
- [Commands](#commands)
  - [open](#open)
  - [login](#login)
  - [edit](#edit)

## What is Hlin?

Hlin is executable for user.

Unlike Ribbon, Hlin is for managing important data and authorization.

## Commands

### Open

`open` command is for opening your agent application with injected execute.exe.

Every command execution request will through and checked byexecution-guard.

### Login

`ogin` command is for login or initialize password.

in strict mode, agent is required `login` and `safeRun` two conditions to execute a command.

and it also appears in something that requires human-verification such as `edit` and `open`.

### Edit

`edit` is for editing data files.

decrypted encrypted data file and create cache.

```
WORKFLOW

hlin edit [target] 
↓
Pop up login window and login
↓
Decrypt and create cache file at .cache folder
↓
User edit cache file
↓
Stop editing from login window
```

there's two ways to stop

| Action | Description |
| :---: | :---: |
| `Ctrl + C`, `close button` | Discard changes |
| `Enter` | Write encrypted changes into .enc file and update checksum.json |






