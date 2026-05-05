"""
Entraîne un petit CNN sur FER (émotions faciales, 7 classes).

Deux formats possibles :
  1) fer2013.csv (colonnes emotion, pixels)
  2) Dossiers décompressés Kaggle : train/ et test/ avec un sous-dossier par classe
     (noms « 0 »…« 6 » ou angry, happy, …) — souvent sans fichier .csv.

Usage :
  pip install -r requirements-train.txt
  python train_emotion_model.py --epochs 40
  python train_emotion_model.py --from-dir "C:/chemin/vers/dossier_decompresse" --epochs 40

Sortie : emotion_model.keras
"""

from __future__ import annotations

import argparse
import os

import numpy as np
import pandas as pd
from PIL import Image
from sklearn.model_selection import train_test_split

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import tensorflow as tf
from tensorflow import keras


EMOTIONS = ("angry", "disgust", "fear", "happy", "sad", "surprise", "neutral")

# Noms de dossiers Kaggle (hors indices 0–6)
FOLDER_NAME_TO_LABEL = {
    "angry": 0,
    "disgust": 1,
    "fear": 2,
    "happy": 3,
    "sad": 4,
    "surprise": 5,
    "neutral": 6,
}


def _folder_name_to_label(dirname: str) -> int:
    d = dirname.strip().lower()
    if d.isdigit():
        i = int(d)
        if 0 <= i <= 6:
            return i
    if d in FOLDER_NAME_TO_LABEL:
        return FOLDER_NAME_TO_LABEL[d]
    raise ValueError(f"Dossier de classe inconnu : {dirname!r} (attendu 0–6 ou {list(FOLDER_NAME_TO_LABEL)})")


def _load_images_from_class_dirs(split_root: str):
    """Charge toutes les images (png/jpg) depuis split_root/<classe>/*."""
    X_list, y_list = [], []
    if not os.path.isdir(split_root):
        return np.array([]), np.array([])
    for sub in sorted(os.listdir(split_root)):
        subpath = os.path.join(split_root, sub)
        if not os.path.isdir(subpath):
            continue
        label = _folder_name_to_label(sub)
        for fn in os.listdir(subpath):
            low = fn.lower()
            if not low.endswith((".png", ".jpg", ".jpeg", ".bmp", ".gif")):
                continue
            path = os.path.join(subpath, fn)
            try:
                img = Image.open(path).convert("L").resize((48, 48), Image.Resampling.BILINEAR)
                arr = np.asarray(img, dtype=np.float32) / 255.0
                X_list.append(arr[..., np.newaxis])
                y_list.append(label)
            except OSError:
                continue
    if not X_list:
        return np.array([]), np.array([])
    X = np.stack(X_list, axis=0)
    y = keras.utils.to_categorical(np.array(y_list, dtype=np.int32), num_classes=7)
    return X, y


def load_fer_from_folders(root: str):
    """
    root = dossier parent contenant train/ et idéalement test/
    (comme l’archive Kaggle avec seulement des dossiers, sans .csv).
    """
    train_root = os.path.join(root, "train")
    test_root = os.path.join(root, "test")
    if not os.path.isdir(train_root):
        raise FileNotFoundError(f"Dossier attendu : {train_root}")

    X_train, y_train = _load_images_from_class_dirs(train_root)
    if len(X_train) == 0:
        raise ValueError(f"Aucune image trouvée sous {train_root}")

    if os.path.isdir(test_root):
        X_test, y_test = _load_images_from_class_dirs(test_root)
        if len(X_test) == 0:
            X_train, X_test, y_train, y_test = train_test_split(
                X_train, y_train, test_size=0.15, random_state=42, stratify=np.argmax(y_train, axis=1)
            )
    else:
        X_train, X_test, y_train, y_test = train_test_split(
            X_train, y_train, test_size=0.15, random_state=42, stratify=np.argmax(y_train, axis=1)
        )

    return (X_train, y_train), (X_test, y_test)


def load_fer_csv(path: str):
    df = pd.read_csv(path)
    if "pixels" not in df.columns or "emotion" not in df.columns:
        raise ValueError("CSV attendu : colonnes 'emotion' et 'pixels' (FER2013).")
    if "Usage" in df.columns:
        u = df["Usage"].astype(str).str.lower()
        train_df = df[u.str.contains("train", na=False)]
        test_df = df[u.str.contains("public", na=False)]
        if len(train_df) < 100 or len(test_df) < 50:
            train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df["emotion"])
    else:
        train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df["emotion"])

    def to_X_y(frame):
        X = np.stack(frame["pixels"].str.split().apply(lambda x: np.array(x, dtype=np.float32)).values)
        X = X.reshape(-1, 48, 48, 1) / 255.0
        y = keras.utils.to_categorical(frame["emotion"].values, num_classes=7)
        return X, y

    return to_X_y(train_df), to_X_y(test_df)


def build_model():
    model = keras.Sequential(
        [
            keras.layers.Input(shape=(48, 48, 1)),
            keras.layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
            keras.layers.BatchNormalization(),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Dropout(0.25),
            keras.layers.Conv2D(128, (3, 3), padding="same", activation="relu"),
            keras.layers.BatchNormalization(),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Dropout(0.25),
            keras.layers.Conv2D(256, (3, 3), padding="same", activation="relu"),
            keras.layers.BatchNormalization(),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Dropout(0.3),
            keras.layers.Flatten(),
            keras.layers.Dense(256, activation="relu"),
            keras.layers.Dropout(0.4),
            keras.layers.Dense(7, activation="softmax"),
        ]
    )
    model.compile(
        optimizer=keras.optimizers.Adam(1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--csv", default="fer2013.csv", help="Chemin vers fer2013.csv (si pas --from-dir)")
    p.add_argument(
        "--from-dir",
        default=None,
        help="Dossier décompressé Kaggle contenant train/ (et optionnellement test/) — sans fichier .csv",
    )
    p.add_argument("--epochs", type=int, default=40)
    p.add_argument("--batch", type=int, default=64)
    p.add_argument("--out", default="emotion_model.keras")
    args = p.parse_args()

    if args.from_dir:
        root = os.path.abspath(args.from_dir)
        if not os.path.isdir(root):
            print("Dossier introuvable :", root)
            raise SystemExit(1)
        print("Chargement depuis dossiers :", root)
        (X_train, y_train), (X_test, y_test) = load_fer_from_folders(root)
    else:
        if not os.path.isfile(args.csv):
            print(
                "Fichier introuvable :",
                args.csv,
                "\nSoit placez fer2013.csv ici, soit utilisez --from-dir <dossier> avec train/ et test/.",
            )
            raise SystemExit(1)
        (X_train, y_train), (X_test, y_test) = load_fer_csv(args.csv)
    print("Train:", X_train.shape, "Test:", X_test.shape)

    model = build_model()
    model.summary()

    early = keras.callbacks.EarlyStopping(patience=6, restore_best_weights=True, monitor="val_accuracy")
    ckpt = keras.callbacks.ModelCheckpoint(args.out, save_best_only=True, monitor="val_accuracy")

    model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        epochs=args.epochs,
        batch_size=args.batch,
        callbacks=[early, ckpt],
        verbose=1,
    )

    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test accuracy: {acc:.4f} — modèle sauvegardé : {args.out}")
    print("Libellés (index 0..6) :", EMOTIONS)


if __name__ == "__main__":
    main()
