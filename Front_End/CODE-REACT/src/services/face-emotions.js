import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";

/**
 * face-api.js dépend de @tensorflow/tfjs-core 1.7 ; le modèle d’émotion utilise @tensorflow/tfjs 4.x.
 * Ne pas charger tf.min.js en global dans index.html : ça casse TinyFaceDetector (engine.js « d is not a function »).
 */
const DEFAULT_MODEL_URL =
  import.meta.env.VITE_FACE_MODEL_URL || "https://justadudewhohacks.github.io/face-api.js/models";

/** Index FER (train_emotion_model.py) -> clés i18n / EMOTION_EMOJI dans VoiceCallLayer */
const FER_INDEX_TO_KEY = ["angry", "disgusted", "fearful", "happy", "sad", "surprised", "neutral"];

function emotionModelUrl() {
  const env = import.meta.env.VITE_EMOTION_MODEL_URL;
  if (env) return env;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  return `${base}emotion-model/model.json`;
}

let tinyFaceOnlyPromise = null;
let expressionModelsPromise = null;
let customModelPromise =
  /** @type {Promise<import("@tensorflow/tfjs").LayersModel | import("@tensorflow/tfjs").GraphModel | null> | null} */ (
    null
  );
let customModelUnavailable = false;

const ensureTinyFaceDetectorOnly = async () => {
  if (!tinyFaceOnlyPromise) {
    tinyFaceOnlyPromise = faceapi.nets.tinyFaceDetector.loadFromUri(DEFAULT_MODEL_URL);
  }
  await tinyFaceOnlyPromise;
};

const ensureFaceExpressionModelsLoaded = async () => {
  if (!expressionModelsPromise) {
    expressionModelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(DEFAULT_MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(DEFAULT_MODEL_URL),
    ]);
  }
  await expressionModelsPromise;
};

async function loadCustomEmotionModel() {
  if (customModelUnavailable) return null;
  if (!customModelPromise) {
    customModelPromise = (async () => {
      try {
        const url = emotionModelUrl();
        try {
          return await tf.loadLayersModel(url);
        } catch {
          return await tf.loadGraphModel(url);
        }
      } catch (e) {
        console.warn("[emotion] TensorFlow.js ou modèle indisponible, secours face-api :", e?.message || e);
        customModelUnavailable = true;
        return null;
      }
    })();
  }
  return customModelPromise;
}

/**
 * @param {{ x: number, y: number, width: number, height: number }} box
 * @param {number} vw
 * @param {number} vh
 */
function clipBox(box, vw, vh) {
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  let w = Math.floor(box.width);
  let h = Math.floor(box.height);
  if (x >= vw || y >= vh) return null;
  if (x + w > vw) w = vw - x;
  if (y + h > vh) h = vh - y;
  if (w < 4 || h < 4) return null;
  return { x, y, width: w, height: h };
}

/**
 * @param {HTMLVideoElement} videoElement
 * @param {import("@tensorflow/tfjs").LayersModel | import("@tensorflow/tfjs").GraphModel} model
 */
async function predictWithCustomModel(videoElement, model) {
  await ensureTinyFaceDetectorOnly();
  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;
  if (!vw || !vh) return null;

  const detection = await faceapi.detectSingleFace(
    videoElement,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }),
  );
  if (!detection) return null;

  const raw = detection.detection.box;
  const box = clipBox(raw, vw, vh);
  if (!box) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(videoElement, box.x, box.y, box.width, box.height, 0, 0, 48, 48);
  const imgData = ctx.getImageData(0, 0, 48, 48);
  const gray = new Float32Array(48 * 48);
  for (let i = 0; i < 48 * 48; i++) {
    const r = imgData.data[i * 4];
    const g = imgData.data[i * 4 + 1];
    const b = imgData.data[i * 4 + 2];
    gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
  }

  const tensor = tf.tensor4d(gray, [1, 48, 48, 1]);
  let pred;
  try {
    /** @type {import("@tensorflow/tfjs").Tensor | null} */
    let out = null;
    try {
      const p = model.predict(tensor);
      out = Array.isArray(p) ? p[0] : p;
    } catch {
      /* GraphModel (SavedModel) : predict peut échouer selon le backend */
      if (typeof model.executeAsync === "function") {
        try {
          out = await model.executeAsync(tensor);
        } catch {
          out = await model.executeAsync({ input_layer: tensor });
        }
      } else if (typeof model.execute === "function") {
        try {
          const p = model.execute(tensor);
          out = Array.isArray(p) ? p[0] : p;
        } catch {
          const p = model.execute({ input_layer: tensor });
          out = Array.isArray(p) ? p[0] : p;
        }
      } else {
        throw new Error("predict/execute indisponibles");
      }
      out = Array.isArray(out) ? out[0] : out;
    }
    pred = out;
    const data = await pred.data();
    tensor.dispose();
    pred.dispose();

    let maxIdx = 0;
    let maxVal = data[0];
    for (let i = 1; i < 7; i++) {
      if (data[i] > maxVal) {
        maxVal = data[i];
        maxIdx = i;
      }
    }
    const label = FER_INDEX_TO_KEY[maxIdx];
    /** @type {Record<string, number>} */
    const expressions = {};
    FER_INDEX_TO_KEY.forEach((k, i) => {
      expressions[k] = data[i];
    });
    return { label, confidence: maxVal, expressions };
  } catch (e) {
    tensor.dispose();
    if (pred) pred.dispose();
    throw e;
  }
}

async function predictWithFaceApi(videoElement) {
  await ensureFaceExpressionModelsLoaded();
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
    .withFaceExpressions();
  if (!detection) return null;
  const ex = detection.expressions;
  const entries = Object.entries(ex);
  entries.sort((a, b) => b[1] - a[1]);
  const [label, confidence] = entries[0];
  return { label, confidence, expressions: ex };
}

/**
 * Détecte l’émotion dominante sur une balise vidéo (patient ou flux distant).
 * Utilise le modèle entraîné (TensorFlow.js) si `public/emotion-model/model.json` est présent, sinon face-api.js.
 *
 * @param {HTMLVideoElement | null} videoElement
 * @returns {Promise<{ label: string, confidence: number, expressions: Record<string, number> } | null>}
 */
export const detectDominantExpression = async (videoElement) => {
  if (!videoElement || videoElement.readyState < 2) return null;

  let model;
  try {
    model = await loadCustomEmotionModel();
  } catch {
    model = null;
  }

  if (model) {
    try {
      return await predictWithCustomModel(videoElement, model);
    } catch (e) {
      console.warn("[emotion] Erreur modèle custom, secours face-api", e);
    }
  }
  return predictWithFaceApi(videoElement);
};

export { ensureFaceExpressionModelsLoaded };
