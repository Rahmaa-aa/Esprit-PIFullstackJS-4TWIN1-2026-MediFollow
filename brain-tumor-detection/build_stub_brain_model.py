#!/usr/bin/env python3
"""
Génère brain_tumor_resnet.keras sans dataset (ResNet50 ImageNet + tête sigmoid non entraînée).

À lancer après clone + pip install -r requirements.txt si vous n'avez pas encore entraîné
avec train_brain_tumor.py. La première exécution télécharge les poids ImageNet (~100 Mo).

Usage:
  python build_stub_brain_model.py
  python build_stub_brain_model.py --force

Avertissement: prédictions non fiables cliniquement — uniquement pour valider Python/TensorFlow
et l’intégration API. Pour un modèle sérieux: python train_brain_tumor.py --data_root ...
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def main() -> None:
    parser = argparse.ArgumentParser(description="Crée brain_tumor_resnet.keras (stub, sans entraînement IRM)")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Remplacer le fichier s'il existe déjà",
    )
    args = parser.parse_args()

    out = ROOT / "brain_tumor_resnet.keras"
    if out.is_file() and not args.force:
        print(f"Déjà présent : {out}")
        print("Utilisez --force pour régénérer, ou supprimez le fichier.")
        sys.exit(0)

    import tensorflow as tf
    from brain_tumor_utils import build_model

    print("Construction du graphe (téléchargement ImageNet la 1ère fois possible)...")
    m = build_model()
    m.save(out)
    print(f"OK — modèle enregistré : {out}")
    print(
        "Note: tête de classification non entraînée sur IRM — entraînez avec train_brain_tumor.py pour la production."
    )


if __name__ == "__main__":
    main()
