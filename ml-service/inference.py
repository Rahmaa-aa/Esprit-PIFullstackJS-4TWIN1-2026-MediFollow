"""Chargement et inférence des modèles CNN (.keras) — entrée 224×224 RGB."""

from __future__ import annotations

import io
import json
import os
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import tensorflow as tf  # noqa: E402

MODEL_FILES: dict[str, str] = {
    "bone_break": "bone_break_cnn.keras",
    "brain_tumor": "brain_tumor_cnn.keras",
    "lung_cancer": "lung_cancer_cnn.keras",
    "renal": "renal_cnn.keras",
    "skin_lesions": "skin_lesions_cnn.keras",
}

# Libellés indicatifs (datasets courants) — à ajuster si besoin via labels.json
DEFAULT_LABELS: dict[str, list[str]] = {
    "brain_tumor": ["glioma", "meningioma", "pituitary", "no_tumor"],
    "lung_cancer": [
        "Adenocarcinoma (pattern NSCLC)",
        "Squamous cell carcinoma pattern",
        "Large cell / other NSCLC pattern",
        "No primary lung malignancy (benign / non-cancer baseline)",
    ],
    "renal": [
        "Normal kidney / no focal lesion",
        "Simple benign cyst",
        "Calculus / obstructive pattern",
        "Solid mass / mass-like lesion (suspicion)",
    ],
    "skin_lesions": [
        "Benign / low malignant concern",
        "Malignant or high-risk lesion (e.g. melanoma-like)",
    ],
    "bone_break": [
        "Avulsion fracture",
        "Comminuted fracture",
        "Fracture Dislocation",
        "Greenstick fracture",
        "Hairline Fracture",
        "Impacted fracture",
        "Longitudinal fracture",
        "Lung Cancer Classification",
        "Oblique fracture",
        "Pathological fracture",
        "Spiral Fracture",
    ],
}


def _models_dir() -> Path:
    return Path(os.environ.get("MODELS_DIR", "/app/models_data")).resolve()


def _load_label_overrides() -> dict[str, list[str]]:
    p = _models_dir().parent / "labels.json"
    if not p.is_file():
        p = Path(__file__).resolve().parent / "labels.json"
    if not p.is_file():
        return {}
    try:
        raw = json.loads(p.read_text(encoding="utf-8"))
        return {k: list(v) for k, v in raw.items() if isinstance(v, list)}
    except (json.JSONDecodeError, OSError):
        return {}


class ModelRegistry:
    def __init__(self) -> None:
        self._models: dict[str, tf.keras.Model] = {}
        self._label_overrides = _load_label_overrides()

    def ensure_loaded(self, key: str) -> tf.keras.Model:
        if key not in MODEL_FILES:
            raise KeyError(key)
        if key not in self._models:
            path = _models_dir() / MODEL_FILES[key]
            if not path.is_file():
                raise FileNotFoundError(f"Modèle introuvable: {path}")
            self._models[key] = tf.keras.models.load_model(str(path))
        return self._models[key]

    def labels_for(self, key: str, num_classes: int) -> list[str]:
        custom = self._label_overrides.get(key)
        if custom and len(custom) == num_classes:
            return custom
        base = DEFAULT_LABELS.get(key, [])
        if len(base) == num_classes:
            return base
        return [f"class_{i}" for i in range(num_classes)]


registry = ModelRegistry()


def _multiclass_uncertainty(probs: np.ndarray) -> dict[str, Any]:
    """Indicateurs lisibles médecins : pas un diagnostic."""
    probs = np.asarray(probs, dtype=np.float64).flatten()
    if probs.size < 2:
        return {}
    probs = probs / probs.sum() if probs.sum() > 0 else probs
    sorted_p = np.sort(probs)[::-1]
    top = float(sorted_p[0])
    second = float(sorted_p[1]) if sorted_p.size > 1 else 0.0
    margin = top - second
    # seuils pragmatiques (softmax) : incertitude élevée si pas de classe dominante nette
    if top < 0.35 or margin < 0.08:
        level = "high"
    elif top < 0.55 or margin < 0.15:
        level = "moderate"
    else:
        level = "low"
    # entropie normalisée 0–1 (1 = très plat)
    ent = float(-np.sum(probs * np.log(probs + 1e-12)))
    denom = np.log(float(probs.size)) if probs.size > 1 else 1.0
    entropy_norm = float(ent / denom) if denom > 1e-9 else 0.0

    return {
        "uncertaintyLevel": level,
        "topProbabilityPct": round(top * 1000) / 10,
        "marginPctPoints": round(margin * 1000) / 10,
        "entropyNormalized": round(entropy_norm * 1000) / 10,
        "runnerUpProbabilityPct": round(second * 1000) / 10,
        "runnerUpIndex": int(np.argsort(-probs)[1]) if probs.size > 1 else None,
    }


def predict_image_bytes(key: str, raw: bytes) -> dict[str, Any]:
    model = registry.ensure_loaded(key)
    h, w = int(model.input_shape[1]), int(model.input_shape[2])
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    img = img.resize((w, h), Image.Resampling.LANCZOS)
    # Les graphes incluent souvent Rescaling(1/255) : entrée 0–255 en float32
    arr = np.asarray(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)

    out = model(arr, training=False)
    probs = np.asarray(out[0], dtype=np.float64)
    n = probs.size

    if n == 1:
        p_pos = float(probs.flat[0])
        p_pos = max(0.0, min(1.0, p_pos))
        labels = registry.labels_for(key, 2)
        probs2 = np.asarray([1.0 - p_pos, p_pos], dtype=np.float64)
        probs2 /= probs2.sum() if probs2.sum() > 0 else probs2
        unc_meta = _multiclass_uncertainty(probs2)
        return {
            "modelKey": key,
            "numClasses": 2,
            "probabilities": [float(1.0 - p_pos), float(p_pos)],
            "classIndex": 1 if p_pos >= 0.5 else 0,
            "label": labels[1] if p_pos >= 0.5 else labels[0],
            "labels": labels,
            **unc_meta,
        }

    if np.any(probs < 0) or np.any(probs > 1.0) or not np.isclose(probs.sum(), 1.0, atol=0.01):
        e = float(np.exp(probs - np.max(probs)))
        probs = e / e.sum()
    else:
        probs = probs / probs.sum() if probs.sum() > 0 else probs

    class_index = int(np.argmax(probs))
    label_list = registry.labels_for(key, n)
    out_unc = _multiclass_uncertainty(probs)
    ru = out_unc.get("runnerUpIndex")
    if isinstance(ru, int) and 0 <= ru < len(label_list):
        out_unc["runnerUpLabel"] = label_list[ru]
    return {
        "modelKey": key,
        "numClasses": n,
        "probabilities": [float(x) for x in probs],
        "classIndex": class_index,
        "label": label_list[class_index] if class_index < len(label_list) else f"class_{class_index}",
        "labels": label_list,
        **out_unc,
    }
