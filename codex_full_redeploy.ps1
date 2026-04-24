param(
    [Parameter(Mandatory = $true)]
    [string]$Server,

    [int]$Port = 22,

    [Parameter(Mandatory = $true)]
    [string]$User,

    [Parameter(Mandatory = $true)]
    [string]$Password,

    [Parameter(Mandatory = $true)]
    [string]$LocalNextPath,

    [Parameter(Mandatory = $true)]
    [string]$RemoteNodeDir,

    [Parameter(Mandatory = $true)]
    [string]$DeployStamp
)

$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH

$resolvedLocalNextPath = (Resolve-Path -LiteralPath $LocalNextPath).Path
$securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$credential = [System.Management.Automation.PSCredential]::new($User, $securePassword)

$remoteUploadDir = "$RemoteNodeDir/.codex-deploy-$DeployStamp"
$remoteBackupDir = "$RemoteNodeDir/.next-predeploy-$DeployStamp"
$remoteLiveDir = "$RemoteNodeDir/.next"
$remoteRestartFile = "$RemoteNodeDir/tmp/restart.txt"

$sshSession = $null
$sftpSession = $null

try {
    $sshSession = New-SSHSession -ComputerName $Server -Port $Port -Credential $credential -AcceptKey
    $sftpSession = New-SFTPSession -ComputerName $Server -Port $Port -Credential $credential -AcceptKey

    New-SFTPItem -SessionId $sftpSession.SessionId -Path $remoteUploadDir -ItemType Directory | Out-Null
    Set-SFTPItem -SessionId $sftpSession.SessionId -Path $resolvedLocalNextPath -Destination $remoteUploadDir -Force

    $remoteCommand = @"
if [ -d '$remoteLiveDir' ]; then
  mv '$remoteLiveDir' '$remoteBackupDir'
fi
mv '$remoteUploadDir/.next' '$remoteLiveDir'
touch '$remoteRestartFile'
printf 'DEPLOY_OK\n'
ls -ld '$remoteLiveDir'
"@

    $result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command $remoteCommand
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
    if ($sshSession) {
        Remove-SSHSession -SessionId $sshSession.SessionId | Out-Null
    }
    if ($sftpSession) {
        Remove-SFTPSession -SessionId $sftpSession.SessionId | Out-Null
    }
}
