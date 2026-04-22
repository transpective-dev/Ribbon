import type { cmd_register } from "../src/logics/templates/interface.ts";

const guard_test = {
    "delete": [
        "del file.txt",
        "del   /f /q C:\\temp\\*.log",
        "erase *.bak",
        "rd /s /q project",
        "rmdir C:\\Windows\\Temp",
        "format E: /q /y",
        "diskpart /s script.txt",
        "Remove-Item -Path C:\\Data -Recurse -Force",
        "Remove-Item -r -Force C:\\Test",
        "Clear-RecycleBin -Drive C",
        "echo This is not a del command",
        "model.txt is deleted",
        "erase_this_file.bat",
        "rdonly attribute changed",
        "diskpartitioner.exe",
        "Remove-Item -Path C:\\safe -WhatIf",
        "`del` (backticks)",
        "DEL /F important.doc",
        "\"Remove-Item -Recurse\" in a string",
        "format C: /fs:NTFS",
        "format C: /q",
        "format C: /fs:NTFS /v:Data /q /x",
        "del",
        "erase"
    ],
    "shutdown": [
        "shutdown /s /t 10",
        "shutdown -r -f",
        "shutdown /l",
        "shutdown /h",
        "shutdown /p",
        "shutdown /s /t 0",
        "Stop-Computer -Confirm:$false",
        "Restart-Computer -Force -Wait",
        "echo shutdown /s /t 300",
        "notepad shutdown_notes.txt",
        "shutdown_now.bat",
        "Stop-ComputerService -Name Spooler",
        "Restart-ComputerNetwork",
        "shutdown /?",
        "shutdown   /s",
        "shutdown /r /t 0 /f /d p:4:1",
        "shutdown /a",
        "shutdown -s -t 999999"
    ],
    "registry": [
        "reg delete HKCU\\Software\\Test /f",
        "reg add HKLM\\Software\\Test /v Version /t REG_SZ /d 1.0 /f",
        "regedit /s C:\\fix.reg",
        "regedit -s silent.reg",
        "Remove-ItemProperty -Path HKLM:\\Software -Name Temp",
        "Set-ItemProperty -Path HKCU:\\Console -Name QuickEdit -Value 1",
        "reg query HKLM\\Software",
        "reg import backup.reg",
        "regedit (no silent)",
        "Remove-Item -Path HKLM:\\Software\\Key",
        "Set-Item -Path Env:Path -Value $env:Path",
        "reg delete /?",
        "ReG DeLeTe HKCU\\Foo /f",
        "reg add \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\" /v RegisteredOwner /d \"User\"",
        "Remove-ItemProperty -Path 'registry::HKEY_LOCAL_MACHINE\\Software\\Test' -Name 'Value'",
        "Set-ItemProperty -Path variable:PSDefaultParameterValues -Name 'Get-ChildItem:Force' -Value $true"
    ],
    "clear-logs": [
        "wevtutil cl System",
        "wevtutil cl Application",
        "Clear-EventLog -LogName Application",
        "Clear-WinEvent -LogName Security",
        "wevtutil epl System backup.evtx",
        "Get-EventLog -LogName Application",
        "Clear-EventLogs",
        "wevtutil cl   Security",
        "WEVTUTIL CL Setup",
        "Clear-EventLog -LogName \"Windows PowerShell\" -ComputerName localhost"
    ],
    "permission": [
        "takeown /f C:\\secure.dat",
        "icacls C:\\Share /grant Everyone:F",
        "icacls report.txt /inheritance:r",
        "cacls folder /E /P User:N",
        "Set-Acl -Path C:\\Data -AclObject $acl",
        "Get-Acl -Path C:\\hosts | Format-List",
        "takeown /?",
        "icalcs.exe (typo)",
        "Set-AclObject",
        "Get-Acl -Path HKLM:\\Software",
        "takeown /f \"C:\\Program Files\" /r /d y",
        "icacls * /T /Q /C /RESET"
    ],
    "mixed_safe_commands": [
        "dir C:\\ | findstr del",
        "echo del /f important.txt",
        "Write-Host 'Remove-Item -Recurse'",
        "Get-Content log.txt | Select-String 'shutdown'",
        "reg.exe query HKLM\\Software",
        "wevtutil el",
        "Get-Acl .",
        "Remove-Variable -Name temp",
        "Stop-Service -Name spooler",
        "Restart-Service -Name wuauserv",
        "Clear-Host",
        "Clear-Content file.log",
        "Remove-Item -Path .\\temp.txt",
        "format-hex file.bin"
    ]
}

import { execution_guard } from "../src/logics/utils/executions/execution_guard.ts";

const test_cmd = async () => {

    const res: {
        true: string[],
        false: string[]
    } = {
        true: [],
        false: []
    }

    for (const [groupName, rule] of Object.entries(guard_test)) {


        for (const cmd of rule) {

            const result = await execution_guard(cmd);

            if (result) {
                res.true.push(cmd);
            } else {
                res.false.push(cmd);
            }

        }

    }

    console.log('detected: ', res.false.length);
    console.log('did not detect: ', res.true.length);
    res.true.forEach(cmd => console.log(cmd));
}

export default {
    command: 'dev',
    desc: 'development commands. for testing features',
    action: () => {
        test_cmd();
    }
}