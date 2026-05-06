import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useTranslation } from "react-i18next";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { useHandGesture } from "../context/HandGestureContext";

const FACE_OPTIONS = {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  },
  runningMode: "VIDEO",
  numFaces: 1,
  outputFaceBlendshapes: true,
  minFaceDetectionConfidence: 0.35,
};

const PHASE_OPEN_MS = 2800;
const PHASE_BLINK_MS = 6400;

function getMaxBlinkScore(faceResult) {
  const cats = faceResult?.faceBlendshapes?.[0]?.categories;
  if (!cats?.length) return null;
  let max = 0;
  let hit = false;
  for (const c of cats) {
    if (c.categoryName === "eyeBlinkLeft" || c.categoryName === "eyeBlinkRight") {
      hit = true;
      max = Math.max(max, c.score);
    }
  }
  return hit ? max : null;
}

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

function computeThresholds(openSamples, blinkSamples) {
  if (openSamples.length < 12) {
    return { ok: false, reason: "open" };
  }
  if (blinkSamples.length < 20) {
    return { ok: false, reason: "blink" };
  }
  const sortedOpen = [...openSamples].sort((a, b) => a - b);
  const openHi = quantile(sortedOpen, 0.88);
  const blinkMax = Math.max(...blinkSamples);
  const span = blinkMax - openHi;
  if (span < 0.1) {
    return { ok: false, reason: "contrast" };
  }
  let on = openHi + span * 0.48;
  let off = openHi + span * 0.26;
  on = Math.min(0.92, Math.max(on, off + 0.07));
  off = Math.max(0.04, Math.min(off, on - 0.07));
  return { ok: true, thresholds: { on, off } };
}

/**
 * @param {{ show: boolean; onHide: () => void; onComplete: (t: { on: number; off: number }) => void }} props
 */
const EyeCalibrationModal = ({ show, onHide, onComplete }) => {
  const { t } = useTranslation();
  const { isActive: fingerNavActive } = useHandGesture();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceLmRef = useRef(null);
  const cancelRef = useRef(false);
  const rafRef = useRef(0);

  const [step, setStep] = useState("loading");
  const [progress, setProgress] = useState(0);
  const [errorKey, setErrorKey] = useState(null);

  const cleanupResources = useCallback(() => {
    cancelRef.current = true;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    try {
      faceLmRef.current?.close?.();
    } catch {
      /* ignore */
    }
    faceLmRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!show) {
      cleanupResources();
      setStep("loading");
      setProgress(0);
      setErrorKey(null);
      return;
    }

    cancelRef.current = false;
    let alive = true;

    const run = async () => {
      setStep("loading");
      setErrorKey(null);
      setProgress(0);
      if (fingerNavActive) {
        setErrorKey("handNavBusy");
        setStep("error");
        return;
      }
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (!alive || cancelRef.current) return;
        const faceLm = await FaceLandmarker.createFromOptions(vision, FACE_OPTIONS);
        if (!alive || cancelRef.current) {
          faceLm.close?.();
          return;
        }
        faceLmRef.current = faceLm;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (!alive || cancelRef.current) {
          stream.getTracks().forEach((tr) => tr.stop());
          faceLm.close?.();
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const openSamples = [];
        const blinkSamples = [];

        const samplePhase = (durationMs, bucket) =>
          new Promise((resolve) => {
            const start = performance.now();
            const tick = () => {
              if (cancelRef.current || !alive) {
                resolve();
                return;
              }
              const elapsed = performance.now() - start;
              setProgress(Math.min(100, (elapsed / durationMs) * 100));
              const v = videoRef.current;
              const lm = faceLmRef.current;
              if (v?.readyState >= 2 && lm) {
                try {
                  const fr = lm.detectForVideo(v, performance.now());
                  if (fr.faceLandmarks?.length > 0) {
                    const s = getMaxBlinkScore(fr);
                    if (s !== null) bucket.push(s);
                  }
                } catch {
                  /* skip frame */
                }
              }
              if (elapsed < durationMs) {
                rafRef.current = requestAnimationFrame(tick);
              } else {
                resolve();
              }
            };
            rafRef.current = requestAnimationFrame(tick);
          });

        setStep("open");
        await samplePhase(PHASE_OPEN_MS, openSamples);
        if (!alive || cancelRef.current) return;

        setStep("blink");
        setProgress(0);
        await samplePhase(PHASE_BLINK_MS, blinkSamples);
        if (!alive || cancelRef.current) return;

        const result = computeThresholds(openSamples, blinkSamples);
        if (!result.ok) {
          setErrorKey(result.reason);
          setStep("error");
          return;
        }

        setProgress(100);
        onComplete(result.thresholds);
      } catch {
        if (!alive || cancelRef.current) return;
        setErrorKey("camera");
        setStep("error");
      }
    };

    run();

    return () => {
      alive = false;
      cleanupResources();
    };
  }, [show, onComplete, cleanupResources, fingerNavActive]);

  const handleClose = () => {
    cleanupResources();
    onHide();
  };

  const title =
    step === "loading"
      ? t("eyeCalibration.titleLoading")
      : step === "open"
        ? t("eyeCalibration.stepOpen")
        : step === "blink"
          ? t("eyeCalibration.stepBlink")
          : step === "error"
            ? t("eyeCalibration.errorTitle")
            : t("eyeCalibration.title");

  const errorBody =
    errorKey === "open"
      ? t("eyeCalibration.error.open")
      : errorKey === "blink"
        ? t("eyeCalibration.error.blink")
        : errorKey === "contrast"
          ? t("eyeCalibration.error.contrast")
          :     errorKey === "camera"
            ? t("eyeCalibration.error.camera")
            : errorKey === "handNavBusy"
              ? t("eyeCalibration.error.handNavBusy")
              : t("eyeCalibration.error.generic");

  const bodyText =
    step === "loading"
      ? t("eyeCalibration.loadingHint")
      : step === "open"
        ? t("eyeCalibration.openHint")
        : step === "blink"
          ? t("eyeCalibration.blinkHint")
          : step === "error"
            ? errorBody
            : "";

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="ratio ratio-4x3 bg-dark rounded mb-3 overflow-hidden" style={{ maxHeight: 260 }}>
          <video ref={videoRef} className="object-fit-cover w-100 h-100" playsInline muted autoPlay />
        </div>
        <p className="mb-3">{bodyText}</p>
        {(step === "open" || step === "blink" || step === "loading") && (
          <ProgressBar now={progress} animated={step === "loading"} variant="primary" />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant={step === "error" ? "primary" : "secondary"} type="button" onClick={handleClose}>
          {step === "error" ? t("eyeCalibration.close") : t("eyeCalibration.cancel")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EyeCalibrationModal;
