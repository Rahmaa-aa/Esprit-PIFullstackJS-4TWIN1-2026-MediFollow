#!/usr/bin/env python3
"""
Entraînement ResNet50 gelé — détection de tumeur cérébrale (yes/no).
Usage:
  python train_brain_tumor.py --data_root "C:/chemin/vers/dataset"
  ou: set BRAIN_MRI_DATA_ROOT puis python train_brain_tumor.py

Sortie: brain_tumor_resnet.keras (format Keras natif) à côté de ce script.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

from brain_tumor_utils import build_model, load_image_for_model, resolve_yes_no_root

IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tif", ".tiff"}


def collect_paths_labels(data_root: Path) -> tuple[list[str], list[int]]:
    paths: list[str] = []
    labels: list[int] = []
    for label, sub in [(0, "no"), (1, "yes")]:
        folder = data_root / sub
        if not folder.is_dir():
            raise FileNotFoundError(f"Dossier attendu introuvable: {folder}")
        for p in folder.iterdir():
            if p.is_file() and p.suffix.lower() in IMG_EXTENSIONS:
                paths.append(str(p.resolve()))
                labels.append(label)
    if not paths:
        raise RuntimeError(f"Aucune image dans {data_root}/yes et {data_root}/no")
    return paths, labels


def load_images_array(paths: list[str]) -> np.ndarray:
    """Charge toutes les images avec le même prétraitement que la prédiction."""
    n = len(paths)
    if n == 0:
        return np.zeros((0, 224, 224, 3), dtype=np.float32)
    out = np.zeros((n, 224, 224, 3), dtype=np.float32)
    for i, p in enumerate(paths):
        out[i] = load_image_for_model(p)
    return out


def plot_history(history: tf.keras.callbacks.History, out_dir: Path) -> None:
    h = history.history
    fig, ax = plt.subplots(1, 2, figsize=(10, 4))
    ax[0].plot(h["loss"], label="train")
    ax[0].plot(h["val_loss"], label="val")
    ax[0].set_title("Loss (binary_crossentropy)")
    ax[0].legend()
    ax[1].plot(h["accuracy"], label="train acc")
    ax[1].plot(h["val_accuracy"], label="val acc")
    ax[1].set_title("Accuracy")
    ax[1].legend()
    plt.tight_layout()
    p = out_dir / "training_history.png"
    plt.savefig(p, dpi=120)
    plt.close()
    print(f"Historique sauvegardé: {p}")


def main() -> None:
    default_root = os.environ.get("BRAIN_MRI_DATA_ROOT", "data")
    parser = argparse.ArgumentParser(description="Entraînement brain tumor ResNet50")
    parser.add_argument(
        "--data_root",
        type=str,
        default=default_root,
        help="Dossier contenant les sous-dossiers yes/ et no/ (défaut: env BRAIN_MRI_DATA_ROOT ou ./data)",
    )
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=16)
    args = parser.parse_args()

    data_root = Path(args.data_root).expanduser().resolve()
    yes_no_root = resolve_yes_no_root(data_root)
    out_dir = Path(__file__).resolve().parent
    model_path = out_dir / "brain_tumor_resnet.keras"

    if yes_no_root != data_root:
        print(f"Dossier yes/no détecté : {yes_no_root} (sous {data_root})")

    paths, labels = collect_paths_labels(yes_no_root)
    y = np.array(labels, dtype=np.int32)

    X_train, X_temp, y_train, y_temp = train_test_split(
        paths, y, test_size=0.3, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )

    print(
        f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)} | Images: {yes_no_root}"
    )

    X_train_a = load_images_array(list(X_train))
    X_val_a = load_images_array(list(X_val))
    X_test_a = load_images_array(list(X_test))
    y_train_f = y_train.astype(np.float32)
    y_val_f = y_val.astype(np.float32)
    y_test_f = y_test.astype(np.float32)

    model = build_model()
    model.compile(
        optimizer=tf.keras.optimizers.Adam(),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    history = model.fit(
        X_train_a,
        y_train_f,
        validation_data=(X_val_a, y_val_f),
        batch_size=args.batch_size,
        epochs=args.epochs,
        verbose=1,
        shuffle=True,
    )

    plot_history(history, out_dir)

    # Évaluation test
    probs = model.predict(X_test_a, batch_size=args.batch_size, verbose=0).flatten()
    y_pred = (probs >= 0.5).astype(np.int32)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print("\n--- Test set ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-score:  {f1:.4f}")

    model.save(model_path)
    print(f"\nModèle sauvegardé: {model_path}")


if __name__ == "__main__":
    main()
