# Introduction

- name: Hlin
- author: Jonathan Monclare
- version: 1.0.0
- license: [GNU AGPLv3](./LICENSE)

## Contents

- [Introduction](#introduction)
	- [Contents](#contents)
	- [Before start](#before-start)
	- [Statement](#statement)
	- [How to use](#how-to-use)

## Before start

This is a simple version. You can check more specific details in [usage.yml](./usage.yml).

## Statement

*This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.*

## How to use

*Note: currently it only works on Windows (because I only have .exe at the moment)*

**File structure** : 
``` powershell

HlinPSModule ( module folder )
├─ *.psm1 
├─ *.psd1 
└─ bin ( root )
   ├─ user.exe ( The main entry point called by the PowerShell module; handles user actions )
   ├─ execute.exe ( executable for injection; for Agent command execution )
   ├─ ribbon.exe ( The core logic engine for commands )
   ├─ utils.exe ( Helper utility for external inputs and states )
   ├─ .cache ( stores cache )
   └─ misc ( stores encrypted data )
   
```

**How to import** : 
```
Add-Content -Path $PROFILE -Value 'Import-Module "path/to/HlinPSModule"'
```

**How to use** : 

1. Enter `hlin open [your-cli-agent-application]` to open your application.
2. Just use it.

**How it works** : 

- When you try to run a dangerous command, execute.exe will block it and refuse to run.

**Something you should know** : 

- I didn't create a new release for the latest version (Hlin 1.0.0) because they won't let me run ribbon.exe with an absolute path while I'm testing. If you have a solution, please let me know.
- This README is an unfinished version, and I currently have no time to refine it. You might be confused while using it. If you have any problems, you can send an email to my email address:

rosettastone0501@gmail.com