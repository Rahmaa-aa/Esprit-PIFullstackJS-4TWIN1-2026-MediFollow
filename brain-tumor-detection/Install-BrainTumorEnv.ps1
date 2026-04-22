#Requires -Version 5.1
# MediFollow brain MRI module: venv, pip, stub Keras model.
# IMPORTANT: This file must stay ASCII-only (no em-dash). Windows PowerShell 5.1
# reads .ps1 as system ANSI by default; UTF-8 breaks strings and causes parse errors.

$ErrorActionPreference = "Stop"

Get-Module Pester -ErrorAction SilentlyContinue | Remove-Module -Force -ErrorAction SilentlyContinue

$Root = $PSScriptRoot
Set-Location $Root

Write-Host "=== MediFollow - brain-tumor-detection (Python + model) ===" -ForegroundColor Cyan
Write-Host "Folder: $Root"

# TensorFlow ships very deep paths; Windows default MAX_PATH=260 breaks pip unless long paths are enabled.
if ($env:OS -match "Windows") {
    $len = $Root.Length
    if ($len -gt 70) {
        Write-Host "WARNING: This folder path is long ($len chars). If pip fails on tensorflow, enable Windows long paths" -ForegroundColor Yellow
        Write-Host "  (see README.md section 'Windows - TensorFlow / long paths') OR move the repo to e.g. C:\dev\MediFollow" -ForegroundColor Yellow
    }
}

function MfIsPython311Or12 {
    param([string]$PythonExe)
    try {
        $v = & $PythonExe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
        if ($v -match '^3\.(11|12)$') { return $true }
    } catch { }
    return $false
}

$venvPy = Join-Path $Root ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPy)) {
    Write-Host "Creating .venv (Python 3.11 or 3.12 required for TensorFlow)..."
    $created = $false
    foreach ($venvArgs in @(@("-3.12", "-m", "venv", ".venv"), @("-3.11", "-m", "venv", ".venv"))) {
        try {
            if (Get-Command py -ErrorAction SilentlyContinue) {
                & py @venvArgs
                if ((Test-Path $venvPy) -and (MfIsPython311Or12 $venvPy)) { $created = $true; break }
            }
        } catch { }
    }
    if (-not $created) {
        try {
            & python -m venv .venv
            if ((Test-Path $venvPy) -and (MfIsPython311Or12 $venvPy)) { $created = $true }
        } catch { }
    }
    if (-not $created -or -not (Test-Path $venvPy)) {
        Write-Host "ERROR: Install Python 3.11 or 3.12, then: py -3.12 -m venv .venv" -ForegroundColor Red
        exit 1
    }
}

Write-Host "pip install -r requirements.txt (may take a few minutes) ..."
& $venvPy -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: pip upgrade failed" -ForegroundColor Red; exit 1 }

& $venvPy -m pip install -r (Join-Path $Root "requirements.txt")
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: pip install failed. On Windows, TensorFlow often needs LONG PATHS enabled (MAX_PATH 260)." -ForegroundColor Red
    Write-Host "1) Open PowerShell as Administrator and run:" -ForegroundColor Yellow
    Write-Host '   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force' -ForegroundColor Gray
    Write-Host "2) Reboot PC or sign out, then DELETE folder .venv here and run this script again." -ForegroundColor Yellow
    Write-Host "   Or clone the repo to a shorter path, e.g. C:\dev\MediFollow" -ForegroundColor Yellow
    exit 1
}

Write-Host "Verifying tensorflow import ..."
& $venvPy -c "import tensorflow as tf; print('tensorflow', tf.__version__)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: tensorflow is broken (partial install?). Delete .venv and retry after enabling Windows long paths." -ForegroundColor Red
    exit 1
}

$stub = Join-Path $Root "build_stub_brain_model.py"
if (-not (Test-Path $stub)) {
    Write-Host "ERROR: build_stub_brain_model.py missing. Run git pull." -ForegroundColor Red
    exit 1
}

Write-Host "Building brain_tumor_resnet.keras (first run may download ImageNet ~100 MB) ..."
& $venvPy $stub
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: build_stub_brain_model.py failed" -ForegroundColor Red
    exit 1
}

$model = Join-Path $Root "brain_tumor_resnet.keras"
if (-not (Test-Path $model)) {
    Write-Host "ERROR: model file was not created." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "OK - Done. Restart backend: cd ..\backend ; npm run start:dev" -ForegroundColor Green
Write-Host "URL: http://localhost:5173/doctor/brain-mri" -ForegroundColor Gray
