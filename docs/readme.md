## General Infomation

- Name: Hlin

- Creator: Jonathan Monclare

- Version: 1.0.0

- License: [PolyForm Noncommercial License](./license)

- Support: Windows for now.

- Contact: rosettastone0501@gmail.com

## Contents

- [Before starting](#before-starting)
- [Values of Hlin](#values-of-hlin)
- [Instructions](#instructions)
  - [Download and Import](#download-and-import)
  - [How to use Hlin](#how-to-use-hlin)
- [Commands](#commands)
  - [Positioning of each command](#positioning-of-each-command)
  - [Hlin commands](#hlin)
  - [Ribbon commands](#ribbon)

## Before starting

This is an overview of Hlin.

If this is your first time using Hlin, we wrote a guide for you.

Check [guide.md](./guide.md) for more details.

## Values of Hlin

`High Security` : Block every unacknowledged execution to prevent before a tragedy occurs.

`Encrypted Data` : All data ( such as config, command macro ) are encrypted to prevent jailbreaking. such as 

- Edit keywords-filter.
- Manipulate command macro to perform actions with `safeRun: true` without authorization. 

`Freedom in Confinement` : Agent can use command macro with `safeRun: true` to bypass  execution-guard.

## Instructions

### Download and Import

**Windows** :

1. Download zip from latest release and unzip it at any folder you want.

2. Use `Add-Content -Path $PROFILE -Value 'Import-Module "path/to/HlinPSModule"'` to import it.

3. Input `hlin` to confirm the action.

---

### How to use Hlin

1. Use `hlin open [your-agent-app]` to open your agent application

2. That's it. Just use like normal.

---

## Commands

### Positioning of each command

| Name | Command | Positioning |
| :--: | :-----: | :---------: |
| Hlin | `hlin` | For user to manage data and authorize. | 
| Ribbon | `rib` | For agent to make action | 

### Hlin commands : 

| Command | Syntax | Action |
| :--: | :-----: | :-----: |
| open | `hlin open [your-agent-app]` | Open your agent application |
| login | `hlin login` | Login or initialize password |
| edit | `hlin edit [config \| macro]` | Edit config or macro |

### Ribbon commands : 

| Command | Alias | Action |
| :-: | :-: | :-: |
| register| `regis`, `add` | Register new command macro | 
| find | - | Find command macro | 
| exec | `run` | Execute command of macro |
| discard | - | Remove command macro | 
| cfg | - | Ribbon's configuration | 

