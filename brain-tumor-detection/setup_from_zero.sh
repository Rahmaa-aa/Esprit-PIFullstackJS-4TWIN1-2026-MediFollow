#!/usr/bin/env bash
# MediFollow — brain-tumor-detection : installation depuis zéro (Linux / macOS)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "=== MediFollow — brain-tumor-detection (setup from zero) ==="
echo "Dossier : $ROOT"

VENV_PY="$ROOT/.venv/bin/python"
if [[ ! -x "$VENV_PY" ]]; then
  echo "Création du venv .venv (Python 3.11 ou 3.12 requis)..."
  if command -v python3.12 &>/dev/null; then python3.12 -m venv .venv
  elif command -v python3.11 &>/dev/null; then python3.11 -m venv .venv
  else python3 -m venv .venv
  fi
fi

"$VENV_PY" -m pip install --upgrade pip
"$VENV_PY" -m pip install -r "$ROOT/requirements.txt"

if [[ ! -f "$ROOT/build_stub_brain_model.py" ]]; then
  echo "ERREUR: build_stub_brain_model.py manquant — clone git incomplet ?"
  exit 1
fi

echo "Génération de brain_tumor_resnet.keras (1ère fois : ~100 Mo ImageNet)..."
"$VENV_PY" "$ROOT/build_stub_brain_model.py"

if [[ ! -f "$ROOT/brain_tumor_resnet.keras" ]]; then
  echo "ERREUR: modèle non créé."
  exit 1
fi

echo "OK — Relancez le backend : cd ../backend && npm run start:dev"
