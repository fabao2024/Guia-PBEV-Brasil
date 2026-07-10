<#
.SYNOPSIS
  Registers a Windows Scheduled Task to keep Fabio's local PBEV repositories synced from GitHub.

.DESCRIPTION
  Creates/updates a scheduled task that runs tools\sync-pbev.ps1 periodically.
  The sync script is guarded: it only pulls with --ff-only when the working tree is clean,
  and never merges, rebases or pushes automatically.

.USAGE
  PowerShell from the Guia PBEV repo:
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\tools\install-sync-task.ps1

  Custom interval:
    .\tools\install-sync-task.ps1 -IntervalMinutes 30

  Remove task:
    .\tools\install-sync-task.ps1 -Uninstall
#>

param(
  [int]$IntervalMinutes = 15,
  [string]$TaskName = "PBEV GitHub Safe Sync",
  [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

function Assert-Windows {
  if (-not $IsWindows -and $PSVersionTable.PSEdition -eq "Core") {
    throw "Este instalador deve ser executado no Windows, dentro do PowerShell local do Fabio."
  }
}

function Resolve-ScriptRoot {
  if ($PSScriptRoot) { return $PSScriptRoot }
  return Split-Path -Parent $MyInvocation.MyCommand.Path
}

Assert-Windows

if ($Uninstall) {
  $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Tarefa removida: $TaskName" -ForegroundColor Green
  } else {
    Write-Host "Tarefa nao encontrada: $TaskName" -ForegroundColor Yellow
  }
  exit 0
}

if ($IntervalMinutes -lt 5) {
  throw "IntervalMinutes minimo recomendado: 5. Valor recebido: $IntervalMinutes"
}

$scriptRoot = Resolve-ScriptRoot
$syncScript = Join-Path $scriptRoot "sync-pbev.ps1"
if (-not (Test-Path $syncScript)) {
  throw "sync-pbev.ps1 nao encontrado em: $syncScript"
}

$logDir = Join-Path $env:LOCALAPPDATA "PBEV"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "sync-pbev.log"

$powershellExe = (Get-Command powershell.exe -ErrorAction Stop).Source
$taskCommand = @"
-NoProfile -ExecutionPolicy Bypass -Command "& '$syncScript' *>&1 | Tee-Object -Append -FilePath '$logFile'"
"@

$action = New-ScheduledTaskAction -Execute $powershellExe -Argument $taskCommand
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

$description = "Safely syncs Guia PBEV Brasil and PBEV Instagram Bot from GitHub using git pull --ff-only when clean. No auto-merge, no auto-push."

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description $description `
  -Force | Out-Null

Write-Host "Tarefa instalada/atualizada: $TaskName" -ForegroundColor Green
Write-Host "Intervalo: $IntervalMinutes minuto(s)" -ForegroundColor Cyan
Write-Host "Script: $syncScript"
Write-Host "Log: $logFile"
Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Cyan
Write-Host "  Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  Get-Content '$logFile' -Tail 80"
Write-Host "  .\tools\install-sync-task.ps1 -Uninstall"
