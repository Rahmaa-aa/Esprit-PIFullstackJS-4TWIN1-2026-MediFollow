import * as faceapi from "face-api.js";

const DEFAULT_MODEL_URL =
  import.meta.env.VITE_FACE_MODEL_URL || "https://justadudewhohacks.github.io/face-api.js/models";

let modelsPromise = null;

export const ensureFaceModelsLoaded = async () => {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(DEFAULT_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(DEFAULT_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(DEFAULT_MODEL_URL),
    ]);
  }
  await modelsPromise;
};

export const captureFaceDescriptor = async (videoElement) => {
  await ensureFaceModelsLoaded();
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("Aucun visage detecte. Positionnez votre visage devant la camera.");
  }
  return Array.from(detection.descriptor || []);
};
