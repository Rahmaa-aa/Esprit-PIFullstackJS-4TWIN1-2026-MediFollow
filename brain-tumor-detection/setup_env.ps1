# Environnement local pour TensorFlow (utiliser Python 3.11 ou 3.12 — pas 3.14).
# Usage : depuis brain-tumor-detection\  →  .\setup_env.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$venvPy = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.12 -c "import sys" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Creation du venv avec Python 3.12 (py -3.12)..."
        py -3.12 -m venv .venv
        $venvPy = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
    }
}
if (-not $venvPy) {
    Write-Host "Creation du venv avec python du PATH (verifiez la version : TensorFlow exige 3.11-3.12)..."
    python -m venv .venv
    $venvPy = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
}

& $venvPy -m pip install --upgrade pip
& (Join-Path $PSScriptRoot ".venv\Scripts\pip.exe") install -r requirements.txt

Write-Host ""
Write-Host "OK. Activez le venv : .\.venv\Scripts\Activate.ps1"
Write-Host "Puis : python train_brain_tumor.py"
Write-Host "Backend NestJS (optionnel) : BRAIN_TUMOR_PYTHON=$venvPy"
