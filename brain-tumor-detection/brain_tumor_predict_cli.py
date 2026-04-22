#!/usr/bin/env python3
"""
CLI pour l'API Node : prédiction + heatmap en JSON (stdout).
Usage : python brain_tumor_predict_cli.py <image_path> [model_path]
Variables : BRAIN_TUMOR_MODEL (chemin .h5 par défaut si modèle non passé)
"""

from __future__ import annotations

import base64
import json
import os
import sys
from pathlib import Path

# Avant tout import TensorFlow (via brain_tumor_utils).
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

ROOT = Path(__file__).resolve().parent


def _default_model_str() -> str:
    """Aligné sur brain_tumor_utils.default_trained_model_path (sans importer TensorFlow ici)."""
    keras_p = ROOT / "brain_tumor_resnet.keras"
    h5_p = ROOT / "brain_tumor_resnet.h5"
    if keras_p.is_file():
        return str(keras_p)
    return str(h5_p)
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: brain_tumor_predict_cli.py <image_path> [model_path]"}))
        sys.exit(1)

    img_path = sys.argv[1]
    default_model = os.environ.get("BRAIN_TUMOR_MODEL", _default_model_str())
    model_path = sys.argv[2] if len(sys.argv) > 2 else default_model

    if not Path(img_path).is_file():
        print(json.dumps({"error": f"Fichier introuvable: {img_path}"}))
        sys.exit(1)
    if not Path(model_path).is_file():
        print(
            json.dumps(
                {
                    "error": f"Modèle introuvable: {model_path}. Entraînez avec train_brain_tumor.py ou définissez BRAIN_TUMOR_MODEL.",
                }
            )
        )
        sys.exit(1)

    import cv2
    from brain_tumor_utils import predict

    try:
        r = predict(img_path, model_path=model_path)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    _, buf = cv2.imencode(".png", cv2.cvtColor(r["overlay_rgb"], cv2.COLOR_RGB2BGR))
    b64 = base64.b64encode(buf).decode("ascii")

    out = {
        "prediction": int(r["prediction"]),
        "probability": float(r["probability"]),
        "labelText": "tumor" if r["prediction"] == 1 else "normal",
        "overlayPngBase64": b64,
    }
    print(json.dumps(out))


if __name__ == "__main__":
    main()
