# Wrapper: spawn clean PowerShell (avoids Pester "Setup" conflict with profile/modules).
$ErrorActionPreference = "Stop"
$main = Join-Path $PSScriptRoot "Install-BrainTumorEnv.ps1"
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $main
