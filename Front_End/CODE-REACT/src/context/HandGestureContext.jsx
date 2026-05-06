import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { FilesetResolver, HandLandmarker, FaceLandmarker } from "@mediapipe/tasks-vision";
import {
  EYE_TRACKING_STORAGE_KEY,
  readEyeCalibration,
  readInitialEyeTrackingPref,
  writeEyeCalibration,
} from "../constants/accessibility";

const HandGestureContext = createContext(null);

const FACE_LANDMARKER_OPTIONS = {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  },
  runningMode: "VIDEO",
  numFaces: 1,
  outputFaceBlendshapes: true,
  minFaceDetectionConfidence: 0.4,
};

const INDEX_TIP = 8;
const DWELL_MS = 800;
/** Blink blendshape thresholds (MediaPipe ARKit-style eyeBlinkLeft / eyeBlinkRight). */
const BLINK_ON = 0.52;
const BLINK_OFF = 0.34;
const BLINK_CLICK_COOLDOWN_MS = 450;
const SMOOTHING = 0.35;
/** Lissage position pastille regard (iris MediaPipe ~468 / ~473). */
const GAZE_SMOOTH = 0.24;
const LEFT_IRIS_IDX = 468;
const RIGHT_IRIS_IDX = 473;
const SCROLL_ZONE = 90;   // px depuis le bord haut/bas
const MAX_SCROLL = 18;    // px max par frame

export const useHandGesture = () => useContext(HandGestureContext);

export const HandGestureProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [dwellProgress, setDwellProgress] = useState(0);
  const [targetedElement, setTargetedElement] = useState(null);
  /** "blink" = click on blink; "dwell" = fallback hold-to-click if face model unavailable */
  const [assistClickMode, setAssistClickMode] = useState("dwell");
  /** Suivi visage / clic par clignement (préférence persistée ; nécessite calibration). */
  const [eyeTrackingEnabled, setEyeTrackingEnabledState] = useState(() => readInitialEyeTrackingPref());
  const [eyeTrackingCalibrated, setEyeTrackingCalibrated] = useState(() => !!readEyeCalibration());
  const [eyeCalibrationModalOpen, setEyeCalibrationModalOpen] = useState(false);
  const [gazePosition, setGazePosition] = useState(null);
  const [error, setError] = useState("");
  const handLandmarkerRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const visionFilesetRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const smoothedRef = useRef({ x: 0, y: 0 });
  const dwellStartRef = useRef(0);
  const dwellTargetRef = useRef(null);
  const blinkPeakRef = useRef(false);
  const lastBlinkClickRef = useRef(0);
  const eyeTrackingEnabledRef = useRef(readInitialEyeTrackingPref());
  const eyeTrackingCalibratedRef = useRef(!!readEyeCalibration());
  const calibrationIntentRef = useRef("enable");
  const blinkThresholdRef = useRef(readEyeCalibration() || { on: BLINK_ON, off: BLINK_OFF });
  const gazeSmoothRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const gazeStandaloneVideoRef = useRef(null);
  const gazeStandaloneStreamRef = useRef(null);
  const gazeStandaloneFaceLmRef = useRef(null);
  const gazeStandaloneRafRef = useRef(null);

  useEffect(() => {
    eyeTrackingEnabledRef.current = eyeTrackingEnabled;
  }, [eyeTrackingEnabled]);

  useEffect(() => {
    eyeTrackingCalibratedRef.current = eyeTrackingCalibrated;
  }, [eyeTrackingCalibrated]);

  const persistEyeTrackingPref = useCallback((enabled) => {
    try {
      localStorage.setItem(EYE_TRACKING_STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const setEyeTrackingEnabled = useCallback(
    (valueOrUpdater) => {
      setEyeTrackingEnabledState((prev) => {
        const next = typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
        persistEyeTrackingPref(next);
        return next;
      });
    },
    [persistEyeTrackingPref]
  );

  const dismissEyeCalibrationModal = useCallback(() => {
    setEyeCalibrationModalOpen(false);
  }, []);

  const openEyeCalibrationModal = useCallback(() => {
    calibrationIntentRef.current = eyeTrackingEnabledRef.current ? "recalibrate" : "enable";
    setEyeCalibrationModalOpen(true);
  }, []);

  const applyEyeCalibration = useCallback(
    (thresholds) => {
      blinkThresholdRef.current = thresholds;
      writeEyeCalibration(thresholds);
      setEyeTrackingCalibrated(true);
      eyeTrackingCalibratedRef.current = true;
      if (calibrationIntentRef.current === "enable") {
        persistEyeTrackingPref(true);
        eyeTrackingEnabledRef.current = true;
        setEyeTrackingEnabledState(true);
      }
      setEyeCalibrationModalOpen(false);
    },
    [persistEyeTrackingPref]
  );

  const requestEyeTrackingToggle = useCallback(() => {
    if (eyeTrackingEnabledRef.current) {
      setEyeTrackingEnabled(false);
      return;
    }
    if (!eyeTrackingCalibratedRef.current) {
      calibrationIntentRef.current = "enable";
      setEyeCalibrationModalOpen(true);
      return;
    }
    setEyeTrackingEnabled(true);
  }, [setEyeTrackingEnabled]);

  const detachFaceLandmarkerOnly = useCallback(() => {
    try {
      faceLandmarkerRef.current?.close?.();
    } catch {
      /* ignore */
    }
    faceLandmarkerRef.current = null;
    blinkPeakRef.current = false;
    lastBlinkClickRef.current = 0;
    setAssistClickMode("dwell");
  }, []);

  const getClickableAtPoint = useCallback((x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    let current = el;
    while (current && current !== document.body) {
      const tag = current.tagName?.toUpperCase();
      const role = current.getAttribute?.("role");
      if (
        current.hasAttribute?.("data-eye-clickable") ||
        tag === "BUTTON" ||
        tag === "A" ||
        (tag === "INPUT" && current.type !== "hidden") ||
        role === "button" ||
        role === "link"
      ) {
        // data-eye-clickable est toujours accepté même dans un conteneur position:fixed
        // (offsetParent === null pour les fixed, mais l'élément est bien visible)
        const visible = current.offsetParent !== null || current.hasAttribute?.("data-eye-clickable");
        if (!current.disabled && visible) return current;
      }
      current = current.parentElement;
    }
    return null;
  }, []);

  const getMaxEyeBlinkScore = useCallback((faceResult) => {
    const cats = faceResult?.faceBlendshapes?.[0]?.categories;
    if (!cats?.length) return 0;
    let max = 0;
    for (const c of cats) {
      if (c.categoryName === "eyeBlinkLeft" || c.categoryName === "eyeBlinkRight") {
        max = Math.max(max, c.score);
      }
    }
    return max;
  }, []);

  const applyGazeFromLandmarks = useCallback((landmarks) => {
    if (!eyeTrackingEnabledRef.current) {
      setGazePosition(null);
      return;
    }
    if (!landmarks || landmarks.length <= RIGHT_IRIS_IDX) {
      setGazePosition(null);
      return;
    }
    const li = landmarks[LEFT_IRIS_IDX];
    const ri = landmarks[RIGHT_IRIS_IDX];
    if (li == null || ri == null) {
      setGazePosition(null);
      return;
    }
    const mx = (li.x + ri.x) / 2;
    const my = (li.y + ri.y) / 2;
    const tx = (1 - mx) * window.innerWidth;
    const ty = my * window.innerHeight;
    const prev = gazeSmoothRef.current;
    const nx = prev.x + GAZE_SMOOTH * (tx - prev.x);
    const ny = prev.y + GAZE_SMOOTH * (ty - prev.y);
    gazeSmoothRef.current = { x: nx, y: ny };
    setGazePosition({ x: nx, y: ny });
  }, []);

  const triggerClick = useCallback((el, clientX, clientY) => {
    if (!el) return;
    if (!el.hasAttribute("data-vk-key")) {
      el.focus?.();
    }
    const r = el.getBoundingClientRect();
    const x = clientX != null ? clientX : r.left + r.width / 2;
    const y = clientY != null ? clientY : r.top + r.height / 2;
    try {
      el.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0 })
      );
      el.dispatchEvent(
        new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0 })
      );
    } catch {
      /* ignore */
    }
    el.click?.();
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.focus();
  }, []);

  /** Mise à jour regard + survol/clic au clignement sous le point rouge (comme une souris). */
  const processGazeBlinkFromFaceResult = useCallback(
    (faceResult) => {
      if (!eyeTrackingEnabledRef.current || !faceResult) return;
      const landmarks = faceResult.faceLandmarks?.[0];
      if (landmarks) {
        applyGazeFromLandmarks(landmarks);
      } else {
        setGazePosition(null);
        setTargetedElement(null);
        setDwellProgress(0);
        return;
      }

      const gx = gazeSmoothRef.current.x;
      const gy = gazeSmoothRef.current.y;
      const blinkScore = getMaxEyeBlinkScore(faceResult);
      const { on: thOn, off: thOff } = blinkThresholdRef.current;
      if (blinkScore >= thOn) blinkPeakRef.current = true;
      else if (blinkScore <= thOff && blinkPeakRef.current) {
        blinkPeakRef.current = false;
        const t = getClickableAtPoint(gx, gy);
        const nowMs = Date.now();
        if (t && nowMs - lastBlinkClickRef.current >= BLINK_CLICK_COOLDOWN_MS) {
          triggerClick(t, gx, gy);
          lastBlinkClickRef.current = nowMs;
        }
      }

      const target = getClickableAtPoint(gx, gy);
      if (target) {
        setTargetedElement(target);
        setDwellProgress(100);
      } else {
        setTargetedElement(null);
        setDwellProgress(0);
      }
    },
    [applyGazeFromLandmarks, getClickableAtPoint, getMaxEyeBlinkScore, triggerClick]
  );

  // Scroll le conteneur scrollable le plus proche sous le curseur, sinon la fenêtre
  const scrollAt = useCallback((x, y, amount) => {
    const el = document.elementFromPoint(x, y);
    let current = el;
    while (current && current !== document.documentElement) {
      const { overflow, overflowY } = getComputedStyle(current);
      if (/auto|scroll/.test(overflow + overflowY) && current.scrollHeight > current.clientHeight) {
        current.scrollBy({ top: amount, behavior: "instant" });
        return;
      }
      current = current.parentElement;
    }
    window.scrollBy({ top: amount, behavior: "instant" });
  }, []);

  const detectFrame = useCallback(() => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;
    if (!video || !handLandmarker || video.readyState < 2) return;

    const nowSec = performance.now() / 1000;
    const result = handLandmarker.detectForVideo(video, nowSec);

    const hasHand = result.landmarks?.length > 0;
    let sx = smoothedRef.current.x;
    let sy = smoothedRef.current.y;

    if (hasHand) {
      const hand = result.landmarks[0];
      const indexTip = hand[INDEX_TIP];
      const x = (1 - indexTip.x) * window.innerWidth;
      const y = indexTip.y * window.innerHeight;
      const prev = smoothedRef.current;
      sx = prev.x + SMOOTHING * (x - prev.x);
      sy = prev.y + SMOOTHING * (y - prev.y);
      smoothedRef.current = { x: sx, y: sy };
      setCursorPosition({ x: sx, y: sy });

      const keyboardOpen = !!document.querySelector("[data-vk-container]");
      if (sy < SCROLL_ZONE) {
        const depth = 1 - sy / SCROLL_ZONE;
        scrollAt(sx, sy, -Math.round(depth * MAX_SCROLL));
      } else if (!keyboardOpen && sy > window.innerHeight - SCROLL_ZONE) {
        const depth = 1 - (window.innerHeight - sy) / SCROLL_ZONE;
        scrollAt(sx, sy, Math.round(depth * MAX_SCROLL));
      }
    } else {
      setTargetedElement(null);
      dwellTargetRef.current = null;
      dwellStartRef.current = 0;
      setDwellProgress(0);
    }

    const faceLm = faceLandmarkerRef.current;
    if (faceLm && eyeTrackingEnabledRef.current) {
      try {
        const faceResult = faceLm.detectForVideo(video, performance.now());
        processGazeBlinkFromFaceResult(faceResult);
      } catch {
        /* skip frame */
      }
    } else if (hasHand) {
      const target = getClickableAtPoint(sx, sy);
      if (target) {
        setTargetedElement(target);
        if (dwellTargetRef.current !== target) {
          dwellTargetRef.current = target;
          dwellStartRef.current = Date.now();
        }
        const elapsed = Date.now() - dwellStartRef.current;
        const progress = Math.min(100, (elapsed / DWELL_MS) * 100);
        setDwellProgress(progress);
        if (elapsed >= DWELL_MS) {
          triggerClick(target, sx, sy);
          dwellTargetRef.current = null;
          dwellStartRef.current = 0;
          setDwellProgress(0);
        }
      } else {
        setTargetedElement(null);
        dwellTargetRef.current = null;
        dwellStartRef.current = 0;
        setDwellProgress(0);
      }
    }

    if (eyeTrackingEnabledRef.current && !faceLm) {
      setGazePosition(null);
    }
  }, [getClickableAtPoint, getMaxEyeBlinkScore, triggerClick, scrollAt, processGazeBlinkFromFaceResult]);

  const runDetection = useCallback(() => {
    detectFrame();
    animationRef.current = requestAnimationFrame(runDetection);
  }, [detectFrame]);

  const startHandGesture = useCallback(async () => {
    setError("");
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        numHands: 1,
        runningMode: "VIDEO",
      });
      handLandmarkerRef.current = handLandmarker;
      visionFilesetRef.current = vision;

      if (eyeTrackingEnabledRef.current) {
        try {
          const faceLandmarker = await FaceLandmarker.createFromOptions(vision, FACE_LANDMARKER_OPTIONS);
          if (!eyeTrackingEnabledRef.current) {
            faceLandmarker.close?.();
          } else {
            faceLandmarkerRef.current = faceLandmarker;
            setAssistClickMode("blink");
          }
        } catch {
          faceLandmarkerRef.current = null;
          setAssistClickMode("dwell");
        }
      } else {
        faceLandmarkerRef.current = null;
        setAssistClickMode("dwell");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;

      const video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;
      video.style.cssText = "position:fixed;top:10px;left:10px;width:160px;height:120px;border:2px solid #0d6efd;border-radius:8px;z-index:99999;object-fit:cover;";
      document.body.appendChild(video);
      videoRef.current = video;
      await video.play();

      setIsActive(true);
      runDetection();
    } catch (err) {
      setError(err.message || "Impossible d'accéder à la webcam. Vérifiez les autorisations.");
      setIsActive(false);
    }
  }, [runDetection]);

  useEffect(() => {
    if (!isActive) return;

    if (!eyeTrackingEnabled) {
      if (faceLandmarkerRef.current) detachFaceLandmarkerOnly();
      return;
    }

    if (faceLandmarkerRef.current || !visionFilesetRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const faceLm = await FaceLandmarker.createFromOptions(visionFilesetRef.current, FACE_LANDMARKER_OPTIONS);
        if (cancelled || !eyeTrackingEnabledRef.current) {
          faceLm.close?.();
          return;
        }
        faceLandmarkerRef.current = faceLm;
        setAssistClickMode("blink");
      } catch {
        if (!cancelled) setAssistClickMode("dwell");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive, eyeTrackingEnabled, detachFaceLandmarkerOnly]);

  useEffect(() => {
    if (!eyeTrackingEnabled) {
      gazeSmoothRef.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      setGazePosition(null);
    }
  }, [eyeTrackingEnabled]);

  useEffect(() => {
    if (!eyeTrackingEnabled || isActive) {
      if (gazeStandaloneRafRef.current) {
        cancelAnimationFrame(gazeStandaloneRafRef.current);
        gazeStandaloneRafRef.current = null;
      }
      try {
        gazeStandaloneFaceLmRef.current?.close?.();
      } catch {
        /* ignore */
      }
      gazeStandaloneFaceLmRef.current = null;
      if (gazeStandaloneStreamRef.current) {
        gazeStandaloneStreamRef.current.getTracks().forEach((t) => t.stop());
        gazeStandaloneStreamRef.current = null;
      }
      if (gazeStandaloneVideoRef.current) {
        gazeStandaloneVideoRef.current.srcObject = null;
        gazeStandaloneVideoRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const boot = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (cancelled || !eyeTrackingEnabledRef.current) return;
        const faceLm = await FaceLandmarker.createFromOptions(vision, FACE_LANDMARKER_OPTIONS);
        if (cancelled || !eyeTrackingEnabledRef.current) {
          faceLm.close?.();
          return;
        }
        gazeStandaloneFaceLmRef.current = faceLm;
        setAssistClickMode("blink");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (cancelled || !eyeTrackingEnabledRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          faceLm.close?.();
          return;
        }
        gazeStandaloneStreamRef.current = stream;
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.srcObject = stream;
        gazeStandaloneVideoRef.current = video;
        await video.play();

        const loop = () => {
          if (cancelled || !eyeTrackingEnabledRef.current) return;
          const v = gazeStandaloneVideoRef.current;
          const lmModel = gazeStandaloneFaceLmRef.current;
          if (v?.readyState >= 2 && lmModel) {
            try {
              const fr = lmModel.detectForVideo(v, performance.now());
              processGazeBlinkFromFaceResult(fr);
            } catch {
              /* skip frame */
            }
          }
          gazeStandaloneRafRef.current = requestAnimationFrame(loop);
        };
        gazeStandaloneRafRef.current = requestAnimationFrame(loop);
      } catch {
        if (!cancelled) {
          setGazePosition(null);
          setAssistClickMode("dwell");
        }
      }
    };

    boot();

    return () => {
      cancelled = true;
      if (gazeStandaloneRafRef.current) {
        cancelAnimationFrame(gazeStandaloneRafRef.current);
        gazeStandaloneRafRef.current = null;
      }
      try {
        gazeStandaloneFaceLmRef.current?.close?.();
      } catch {
        /* ignore */
      }
      gazeStandaloneFaceLmRef.current = null;
      if (gazeStandaloneStreamRef.current) {
        gazeStandaloneStreamRef.current.getTracks().forEach((t) => t.stop());
        gazeStandaloneStreamRef.current = null;
      }
      if (gazeStandaloneVideoRef.current) {
        gazeStandaloneVideoRef.current.srcObject = null;
        gazeStandaloneVideoRef.current = null;
      }
    };
  }, [eyeTrackingEnabled, isActive, processGazeBlinkFromFaceResult]);

  const stopHandGesture = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current?.parentNode) {
      videoRef.current.parentNode.removeChild(videoRef.current);
      videoRef.current = null;
    }
    handLandmarkerRef.current = null;
    visionFilesetRef.current = null;
    try {
      faceLandmarkerRef.current?.close?.();
    } catch {
      /* ignore */
    }
    faceLandmarkerRef.current = null;
    blinkPeakRef.current = false;
    lastBlinkClickRef.current = 0;
    setAssistClickMode("dwell");
    setIsActive(false);
    setCursorPosition({ x: 0, y: 0 });
    setDwellProgress(0);
    setTargetedElement(null);
  }, []);

  useEffect(() => () => stopHandGesture(), [stopHandGesture]);

  return (
    <HandGestureContext.Provider
      value={{
        isActive,
        cursorPosition,
        dwellProgress,
        targetedElement,
        assistClickMode,
        eyeTrackingEnabled,
        eyeTrackingCalibrated,
        requestEyeTrackingToggle,
        openEyeCalibrationModal,
        eyeCalibrationModalOpen,
        dismissEyeCalibrationModal,
        applyEyeCalibration,
        setEyeTrackingEnabled,
        gazePosition,
        error,
        startHandGesture,
        stopHandGesture,
        setError,
      }}
    >
      {children}
    </HandGestureContext.Provider>
  );
};
