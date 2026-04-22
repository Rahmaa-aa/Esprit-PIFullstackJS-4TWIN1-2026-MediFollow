"""
Utilitaires : prétraitement IRM, construction ResNet50 (ImageNet, gelé),
Grad-CAM et prédiction pour brain_tumor_predict_cli.py.
"""

from __future__ import annotations

import os

# Avant import TensorFlow : réduit le bruit sur stderr (évite de polluer stdout pour l’API Node).
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

from pathlib import Path
from typing import Any

import cv2
import numpy as np
import tensorflow as tf

IMAGE_SIZE = 224
RESNET_LAYER_NAME = "resnet50"


def default_trained_model_path() -> Path:
    """Fichier modèle par défaut : `.keras` (recommandé) si présent, sinon `.h5` (ancien)."""
    parent = Path(__file__).resolve().parent
    keras_p = parent / "brain_tumor_resnet.keras"
    if keras_p.is_file():
        return keras_p
    return parent / "brain_tumor_resnet.h5"


def resolve_yes_no_root(data_root: Path) -> Path:
    """
    Retourne le dossier qui contient directement « yes/ » et « no/ ».

    Accepte soit ``data_root/yes`` et ``data_root/no`` (Kaggle à la racine),
    soit ``data_root/<sous-dossier>/yes`` et ``.../no`` (ex. ``brain_tumor_dataset``).
    """
    root = data_root.expanduser().resolve()
    yes = root / "yes"
    no = root / "no"
    if yes.is_dir() and no.is_dir():
        return root

    candidates: list[Path] = []
    if root.is_dir():
        for sub in sorted(root.iterdir()):
            if sub.is_dir() and (sub / "yes").is_dir() and (sub / "no").is_dir():
                candidates.append(sub)

    if len(candidates) == 1:
        return candidates[0]
    if len(candidates) > 1:
        preferred = [c for c in candidates if c.name.lower() == "brain_tumor_dataset"]
        if len(preferred) == 1:
            return preferred[0]
        return candidates[0]

    raise FileNotFoundError(
        f"Pas de dossiers « yes » et « no » sous {root} "
        f"(directement ou dans un sous-dossier du premier niveau)."
    )


def find_brain_mri_data_root(start: Path | None = None) -> Path | None:
    """Remonte les parents et cherche yes/no (directs ou dans un sous-dossier)."""
    cur = (start or Path.cwd()).resolve()
    for _ in range(8):
        try:
            return resolve_yes_no_root(cur)
        except FileNotFoundError:
            pass
        if cur.parent == cur:
            break
        cur = cur.parent
    return None


def _ensure_rgb(img: np.ndarray) -> np.ndarray:
    if img.ndim == 2:
        return np.stack([img, img, img], axis=-1)
    if img.shape[-1] == 4:
        return img[..., :3]
    if img.shape[-1] == 1:
        return np.repeat(img, 3, axis=-1)
    return img


def load_image_for_model(path: str | Path) -> np.ndarray:
    """Charge une image, redimensionne 224x224, RGB, pixels dans [0, 1]."""
    p = str(path)
    raw = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if raw is None:
        raise FileNotFoundError(f"Impossible de lire l'image: {p}")
    if raw.ndim == 2:
        raw = cv2.cvtColor(raw, cv2.COLOR_GRAY2RGB)
    else:
        raw = cv2.cvtColor(raw, cv2.COLOR_BGR2RGB)
    raw = _ensure_rgb(raw)
    raw = cv2.resize(raw, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)
    return (raw.astype(np.float32) / 255.0).clip(0.0, 1.0)


def build_model() -> tf.keras.Model:
    """ResNet50 ImageNet, sans tête, couches gelées + Dense(1, sigmoid)."""
    base = tf.keras.applications.ResNet50(
        include_top=False,
        weights="imagenet",
        input_shape=(IMAGE_SIZE, IMAGE_SIZE, 3),
        name=RESNET_LAYER_NAME,
    )
    base.trainable = False
    x = tf.keras.layers.GlobalAveragePooling2D(name="gap")(base.output)
    out = tf.keras.layers.Dense(1, activation="sigmoid", name="tumor_prob")(x)
    return tf.keras.Model(inputs=base.input, outputs=out, name="brain_tumor_resnet")


def get_last_conv_output_tensor(model: tf.keras.Model) -> tf.Tensor:
    """
    Sortie 4D avant GAP : soit couche `resnet50` (entraînement), soit dernière conv ResNet50
    quand le `.h5` a été sauvegardé avec un graphe aplati (`conv5_block3_out`, …).
    """
    try:
        inner = model.get_layer(RESNET_LAYER_NAME)
        return inner.output
    except ValueError:
        pass
    for name in ("conv5_block3_out", "conv5_block3_out_activation"):
        try:
            return model.get_layer(name).output
        except ValueError:
            continue
    gap_idx = next((i for i, layer in enumerate(model.layers) if layer.name == "gap"), None)
    layers_before = model.layers[:gap_idx] if gap_idx is not None else model.layers
    for layer in reversed(layers_before):
        try:
            sh = layer.output_shape
        except Exception:
            continue
        if isinstance(sh, list):
            sh = sh[0] if sh else None
        if sh is not None and len(sh) == 4 and sh[-1] and sh[-1] > 1:
            return layer.output
    raise ValueError(
        "Impossible de trouver la sortie conv 4D (ResNet). "
        "Couches connues : " + ", ".join(l.name for l in model.layers[:12]) + "…"
    )


def _heatmap_to_rgb_overlay(
    hm224: np.ndarray,
    img_u8: np.ndarray,
    *,
    overlay_alpha: float = 0.58,
) -> np.ndarray:
    """JET sur [0,255] puis fusion — poids colormap élevé pour contraste visible vs IRM."""
    hm_u8 = np.clip(hm224 * 255.0, 0, 255).astype(np.uint8)
    heat_bgr = cv2.applyColorMap(hm_u8, cv2.COLORMAP_JET)
    heat_rgb = cv2.cvtColor(heat_bgr, cv2.COLOR_BGR2RGB)
    a = float(np.clip(overlay_alpha, 0.35, 0.78))
    # addWeighted évite les arrondis qui ternissent les couleurs
    return cv2.addWeighted(img_u8, 1.0 - a, heat_rgb, a, 0)


def _normalize_heatmap_vis(heatmap_np: np.ndarray) -> np.ndarray:
    """Étire les percentiles pour que JET ne reste pas bleu/gris (gradients faibles)."""
    h = heatmap_np.astype(np.float64)
    flat = h.flatten()
    lo, hi = np.percentile(flat, [5.0, 95.0])
    if hi <= lo + 1e-8:
        h = (h - h.min()) / (h.max() - h.min() + 1e-8)
    else:
        h = (h - lo) / (hi - lo)
    return np.clip(h, 0.0, 1.0).astype(np.float32)


def _build_grad_model(model: tf.keras.Model) -> tf.keras.Model:
    """Sous-modèle [entrée complète] → [carte conv ResNet, probabilité]."""
    conv_out = get_last_conv_output_tensor(model)
    outs = [conv_out, model.output]
    try:
        return tf.keras.Model(inputs=model.inputs, outputs=outs)
    except Exception:
        return tf.keras.Model(inputs=model.input, outputs=outs)


def activation_map_overlay(model: tf.keras.Model, img_batch: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Carte sans gradient : moyenne des |activation| par pixel (toujours colorée après JET).
    Repli si Grad-CAM échoue.
    """
    img_t = tf.convert_to_tensor(img_batch, dtype=tf.float32)
    conv_tensor = get_last_conv_output_tensor(model)
    try:
        feat_model = tf.keras.Model(inputs=model.inputs, outputs=conv_tensor)
    except Exception:
        feat_model = tf.keras.Model(inputs=model.input, outputs=conv_tensor)
    feats = feat_model(img_t, training=False)
    heatmap = tf.reduce_mean(tf.abs(feats[0]), axis=-1).numpy()
    heatmap_np = _normalize_heatmap_vis(heatmap.astype(np.float64))
    hm224 = cv2.resize(heatmap_np, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_CUBIC)
    hm224 = np.clip(hm224, 0.0, 1.0)
    img_u8 = (img_batch[0] * 255.0).clip(0, 255).astype(np.uint8)
    overlay = _heatmap_to_rgb_overlay(hm224, img_u8, overlay_alpha=0.62)
    return hm224, overlay


def grad_cam_overlay(
    model: tf.keras.Model,
    img_batch: np.ndarray,
    last_conv_name: str | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Grad-CAM : heatmap (H, W) normalisée et image RGB (H, W, 3) superposée.
    img_batch : (1, 224, 224, 3) float32 [0,1]
    """
    _ = last_conv_name  # rétrocompat API
    img_t = tf.convert_to_tensor(img_batch, dtype=tf.float32)

    grad_model = _build_grad_model(model)

    with tf.GradientTape(persistent=True) as tape:
        conv_out, preds = grad_model(img_t)
        class_score = preds[:, 0]

    grads = tape.gradient(class_score, conv_out)
    del tape

    conv_np = conv_out[0].numpy()

    if grads is not None:
        pooled_grads = tf.reduce_mean(grads, axis=(1, 2))
        pooled = pooled_grads[0].numpy()
        heatmap = np.sum(conv_np * pooled, axis=-1)
        heatmap = np.maximum(heatmap, 0)
        if np.max(heatmap) < 1e-8:
            heatmap = np.mean(np.abs(conv_np), axis=-1)
    else:
        heatmap = np.mean(np.abs(conv_np), axis=-1)

    heatmap_np = _normalize_heatmap_vis(heatmap.astype(np.float64))

    hm224 = cv2.resize(heatmap_np, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_CUBIC)
    hm224 = np.clip(hm224, 0.0, 1.0)

    img_u8 = (img_batch[0] * 255.0).clip(0, 255).astype(np.uint8)
    overlay = _heatmap_to_rgb_overlay(hm224, img_u8, overlay_alpha=0.58)
    return hm224, overlay


def predict(
    image_path: str | Path,
    model_path: str | Path | None = None,
    model: tf.keras.Model | None = None,
) -> dict[str, Any]:
    """
    Retourne prediction (0/1), probabilité, heatmap et overlay RGB.
    """
    path = Path(image_path)
    if model_path:
        mp = Path(model_path)
    else:
        env = os.environ.get("BRAIN_TUMOR_MODEL")
        mp = Path(env) if env else default_trained_model_path()

    if model is None:
        if not mp.is_file():
            raise FileNotFoundError(f"Modèle introuvable: {mp}")
        model = tf.keras.models.load_model(mp, compile=False)

    arr = load_image_for_model(path)
    batch = np.expand_dims(arr, axis=0)
    prob = float(model.predict(batch, verbose=0)[0, 0])
    pred = 1 if prob >= 0.5 else 0

    try:
        _, overlay_rgb = grad_cam_overlay(model, batch.astype(np.float32))
    except Exception:
        # Jamais renvoyer une copie de l’IRM : carte d’activation colorée (JET)
        _, overlay_rgb = activation_map_overlay(model, batch.astype(np.float32))
    return {
        "prediction": pred,
        "probability": prob,
        "heatmap": None,  # optionnel ; overlay suffit pour l’UI
        "overlay_rgb": overlay_rgb,
    }


def predict_image(
    image_path: str | Path,
    model_path: str | Path | None = None,
) -> dict[str, Any]:
    """Alias explicite pour scripts externes."""
    return predict(image_path, model_path=model_path)
