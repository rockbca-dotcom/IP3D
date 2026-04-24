param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('cmd', 'read', 'write', 'list')]
    [string]$Mode,

    [Parameter(Mandatory = $true)]
    [string]$Server,

    [int]$Port = 22,

    [Parameter(Mandatory = $true)]
    [string]$User,

    [Parameter(Mandatory = $true)]
    [string]$Password,

    [string]$Command,
    [string]$Path,
    [string]$Content,
    [string]$LocalPath
)

$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH

$securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$credential = [System.Management.Automation.PSCredential]::new($User, $securePassword)

function Close-Session {
    param(
        [string]$Kind,
        [int]$SessionId
    )

    if ($Kind -eq 'ssh') {
        Remove-SSHSession -SessionId $SessionId | Out-Null
        return
    }

    Remove-SFTPSession -SessionId $SessionId | Out-Null
}

switch ($Mode) {
    'cmd' {
        if (-not $Command) {
            throw 'Command is required when Mode=cmd.'
        }

        $session = New-SSHSession -ComputerName $Server -Port $Port -Credential $credential -AcceptKey
        try {
            $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $Command
            if ($result.Output) {
                $result.Output
            }
            if ($result.Error) {
                Write-Error ($result.Error -join [Environment]::NewLine)
            }
            if ($result.ExitStatus -ne 0) {
                exit $result.ExitStatus
            }
        }
        finally {
            Close-Session -Kind 'ssh' -SessionId $session.SessionId
        }
    }

    'read' {
        if (-not $Path) {
            throw 'Path is required when Mode=read.'
        }

        $session = New-SFTPSession -ComputerName $Server -Port $Port -Credential $credential -AcceptKey
        try {
            $remoteContent = Get-SFTPContent -SessionId $session.SessionId -Path $Path -ContentType String -Encoding UTF8
            if ($LocalPath) {
                $parent = Split-Path -Parent $LocalPath
                if ($parent -and -not (Test-Path -LiteralPath $parent)) {
                    New-Item -ItemType Directory -Path $parent -Force | Out-Null
                }
                [System.IO.File]::WriteAllText($LocalPath, $remoteContent, [System.Text.UTF8Encoding]::new($false))
            }
            else {
                $remoteContent
            }
        }
        finally {
            Close-Session -Kind 'sftp' -SessionId $session.SessionId
        }
    }

    'write' {
        if (-not $Path) {
            throw 'Path is required when Mode=write.'
        }

        $session = New-SFTPSession -ComputerName $Server -Port $Port -Credential $credential -AcceptKey
        try {
            $valueToWrite = $Content
            if ($LocalPath) {
                $valueToWrite = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $LocalPath))
            }
            if ($null -eq $valueToWrite) {
                throw 'Content or LocalPath is required when Mode=write.'
            }

            Set-SFTPContent -SessionId $session.SessionId -Path $Path -Value $valueToWrite -Encoding UTF8 | Out-Null
        }
        finally {
            Close-Session -Kind 'sftp' -SessionId $session.SessionId
        }
    }

    'list' {
        if (-not $Path) {
            throw 'Path is required when Mode=list.'
        }

        $session = New-SFTPSession -ComputerName $Server -Port $Port -Credential $credential -AcceptKey
        try {
            Get-SFTPChildItem -SessionId $session.SessionId -Path $Path |
                Select-Object FullName, IsDirectory, Length, LastWriteTime |
                Format-Table -AutoSize
        }
        finally {
            Close-Session -Kind 'sftp' -SessionId $session.SessionId
        }
    }
}
