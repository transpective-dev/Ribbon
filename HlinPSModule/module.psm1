# function name == prefix whenyou execute
function hlin {
    [CmdletBinding()]
    param(
        # 如果你想让 PowerShell 接收参数并传给 Bun，可以定义参数
        [Parameter(Mandatory = $false)]
        [string]$Mode
    )

    # 2. 动态获取当前 .psm1 文件所在的物理绝对路径
    # $PSScriptRoot 是内置变量，能保证用户把工具解压到任何地方都能正确定位 bin 目录
    $ExePath = Join-Path $PSScriptRoot "bin\executor.exe"

    & $ExePath @args
    
    # 3. 检查 .exe 是否存在，防止用户漏解压
    if (-not (Test-Path $ExePath)) {
        Write-Error "找不到核心可执行文件：$ExePath"
        return
    }

    # 4. 关键：启动你的 Bun 程序
    # 使用 & (Call Operator) 直接在当前进程的前台同步运行它
    # 这样能把当前 PS 终端的 Raw Mode 所有权无缝交棒给 Enquirer UI
    if ($Mode) {
        & $ExePath --mode $Mode
    } else {
        & $ExePath
    }

}

# 5. 【必须】明确声明将这个函数导出给用户。不导出的函数，用户敲命令时会找不到。
Export-ModuleMember -Function hlin
