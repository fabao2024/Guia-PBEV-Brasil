<#
.SYNOPSIS
  Synchronizes Fabio's local PBEV repositories from GitHub safely.

.DESCRIPTION
  - Never merges automatically.
  - Never pushes automatically.
  - Only runs `git pull --ff-only` when the working tree is clean.
  - Stops and prints instructions when local changes or divergence are detected.

.USAGE
  PowerShell:
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\scripts\sync-pbev.ps1

  Or from anywhere:
    powershell -ExecutionPolicy Bypass -File "C:\Users\fabio\Guia-PBEV-Brasil\scripts\sync-pbev.ps1"
#>

$ErrorActionPreference = "Stop"

$Repos = @(
  [ordered]@{
    Name = "Guia PBEV Brasil"
    Path = "C:\Users\fabio\Guia-PBEV-Brasil"
    ExpectedRemote = "fabao2024/Guia-PBEV-Brasil"
  },
  [ordered]@{
    Name = "PBEV Instagram Bot"
    Path = "C:\Users\fabio\OneDrive\Documentos\I.A jobs\testes\Guia PBEV\pbev-instagram-bot"
    ExpectedRemote = "fabao2024/PBEV-Instagram-Automation"
  }
)

function Run-Git {
  param(
    [Parameter(Mandatory=$true)][string]$RepoPath,
    [Parameter(Mandatory=$true)][string[]]$Args
  )

  $output = & git -C $RepoPath @Args 2>&1
  $code = $LASTEXITCODE
  return [pscustomobject]@{ Code = $code; Output = ($output -join "`n") }
}

function Assert-GitAvailable {
  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) {
    throw "Git nao encontrado no PATH. Instale Git for Windows ou abra pelo terminal da IDE com Git disponivel."
  }
}

function Sync-Repo {
  param([hashtable]$Repo)

  Write-Host ""
  Write-Host "============================================================" -ForegroundColor DarkGray
  Write-Host "Repo: $($Repo.Name)" -ForegroundColor Cyan
  Write-Host "Path: $($Repo.Path)"

  if (-not (Test-Path $Repo.Path)) {
    Write-Host "SKIP: pasta nao encontrada." -ForegroundColor Yellow
    return [pscustomobject]@{ Name = $Repo.Name; Status = "missing"; Commit = "" }
  }

  $inside = Run-Git $Repo.Path @("rev-parse", "--is-inside-work-tree")
  if ($inside.Code -ne 0 -or $inside.Output.Trim() -ne "true") {
    Write-Host "SKIP: pasta existe, mas nao parece ser um repositorio Git." -ForegroundColor Yellow
    return [pscustomobject]@{ Name = $Repo.Name; Status = "not_git"; Commit = "" }
  }

  $remote = Run-Git $Repo.Path @("remote", "get-url", "origin")
  if ($remote.Code -ne 0) {
    Write-Host "BLOCKED: origin remoto nao configurado." -ForegroundColor Red
    return [pscustomobject]@{ Name = $Repo.Name; Status = "no_origin"; Commit = "" }
  }

  if ($remote.Output -notlike "*$($Repo.ExpectedRemote)*") {
    Write-Host "WARN: origin inesperado: $($remote.Output)" -ForegroundColor Yellow
    Write-Host "Esperado conter: $($Repo.ExpectedRemote)" -ForegroundColor Yellow
  }

  $branch = Run-Git $Repo.Path @("branch", "--show-current")
  Write-Host "Branch: $($branch.Output.Trim())"

  $status = Run-Git $Repo.Path @("status", "--porcelain")
  if ($status.Output.Trim().Length -gt 0) {
    Write-Host "BLOCKED: existem alteracoes locais. Nada foi sincronizado." -ForegroundColor Red
    Write-Host $status.Output
    Write-Host "Acoes seguras:" -ForegroundColor Yellow
    Write-Host "  - revisar/commitar as alteracoes locais; ou"
    Write-Host "  - git stash; git pull --ff-only; git stash pop; ou"
    Write-Host "  - git restore .  (SOMENTE se quiser descartar tudo)"
    return [pscustomobject]@{ Name = $Repo.Name; Status = "local_changes"; Commit = "" }
  }

  Write-Host "Fetching origin..."
  $fetch = Run-Git $Repo.Path @("fetch", "origin", "--prune")
  if ($fetch.Code -ne 0) {
    Write-Host "FAILED: git fetch falhou." -ForegroundColor Red
    Write-Host $fetch.Output
    return [pscustomobject]@{ Name = $Repo.Name; Status = "fetch_failed"; Commit = "" }
  }

  $upstream = Run-Git $Repo.Path @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")
  if ($upstream.Code -ne 0) {
    Write-Host "BLOCKED: branch sem upstream. Configure origin/main antes." -ForegroundColor Red
    return [pscustomobject]@{ Name = $Repo.Name; Status = "no_upstream"; Commit = "" }
  }

  $counts = Run-Git $Repo.Path @("rev-list", "--left-right", "--count", "HEAD...@{u}")
  if ($counts.Code -ne 0) {
    Write-Host "FAILED: nao consegui comparar com upstream." -ForegroundColor Red
    Write-Host $counts.Output
    return [pscustomobject]@{ Name = $Repo.Name; Status = "compare_failed"; Commit = "" }
  }

  $parts = $counts.Output.Trim() -split "\s+"
  $ahead = [int]$parts[0]
  $behind = [int]$parts[1]
  Write-Host "Ahead: $ahead | Behind: $behind"

  if ($ahead -gt 0 -and $behind -gt 0) {
    Write-Host "BLOCKED: branch divergiu. Nao vou fazer merge/rebase automatico." -ForegroundColor Red
    return [pscustomobject]@{ Name = $Repo.Name; Status = "diverged"; Commit = "" }
  }

  if ($ahead -gt 0) {
    Write-Host "BLOCKED: ha commits locais ainda nao publicados. Nao vou fazer push automatico." -ForegroundColor Red
    return [pscustomobject]@{ Name = $Repo.Name; Status = "ahead"; Commit = "" }
  }

  if ($behind -gt 0) {
    Write-Host "Pull --ff-only..." -ForegroundColor Green
    $pull = Run-Git $Repo.Path @("pull", "--ff-only")
    if ($pull.Code -ne 0) {
      Write-Host "FAILED: git pull --ff-only falhou." -ForegroundColor Red
      Write-Host $pull.Output
      return [pscustomobject]@{ Name = $Repo.Name; Status = "pull_failed"; Commit = "" }
    }
    Write-Host $pull.Output
  } else {
    Write-Host "OK: ja estava atualizado." -ForegroundColor Green
  }

  $commit = Run-Git $Repo.Path @("log", "--oneline", "-1")
  Write-Host "HEAD: $($commit.Output.Trim())" -ForegroundColor Green
  return [pscustomobject]@{ Name = $Repo.Name; Status = "ok"; Commit = $commit.Output.Trim() }
}

Assert-GitAvailable

$results = @()
foreach ($repo in $Repos) {
  $results += Sync-Repo $repo
}

Write-Host ""
Write-Host "Resumo" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$blocked = $results | Where-Object { $_.Status -ne "ok" }
if ($blocked.Count -gt 0) {
  Write-Host "Alguns repos precisam de acao manual antes de sincronizar." -ForegroundColor Yellow
  exit 1
}

Write-Host "Todos os repos estao sincronizados com GitHub." -ForegroundColor Green
exit 0
