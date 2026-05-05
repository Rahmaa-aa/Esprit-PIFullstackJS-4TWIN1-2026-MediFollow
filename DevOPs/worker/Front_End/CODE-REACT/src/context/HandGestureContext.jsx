import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const HandGestureContext = createContext(null);

const INDEX_TIP = 8;
const DWELL_MS = 800;
const SMOOTHING = 0.35;
const SCROLL_ZONE = 90;   // px depuis le bord haut/bas
const MAX_SCROLL = 18;    // px max par frame

export const useHandGesture = () => useContext(HandGestureContext);

export const HandGestureProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [dwellProgress, setDwellProgress] = useState(0);
  const [targetedElement, setTargetedElement] = useState(null);
  const [error, setError] = useState("");
  const handLandmarkerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const smoothedRef = useRef({ x: 0, y: 0 });
  const dwellStartRef = useRef(0);
  const dwellTargetRef = useRef(null);

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

  const triggerClick = useCallback((el) => {
    if (!el) return;
    // Ne pas voler le focus si c'est une touche du clavier virtuel
    if (!el.hasAttribute("data-vk-key")) {
      el.focus?.();
    }
    el.click?.();
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.focus();
  }, []);

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

    const now = performance.now() / 1000;
    const result = handLandmarker.detectForVideo(video, now);

    if (result.landmarks?.length > 0) {
      const hand = result.landmarks[0];
      const indexTip = hand[INDEX_TIP];

      const x = (1 - indexTip.x) * window.innerWidth;
      const y = indexTip.y * window.innerHeight;
      const prev = smoothedRef.current;
      const sx = prev.x + SMOOTHING * (x - prev.x);
      const sy = prev.y + SMOOTHING * (y - prev.y);
      smoothedRef.current = { x: sx, y: sy };
      setCursorPosition({ x: sx, y: sy });

      // Scroll automatique quand le doigt est près du bord haut ou bas
      const keyboardOpen = !!document.querySelector("[data-vk-container]");
      if (sy < SCROLL_ZONE) {
        const depth = 1 - sy / SCROLL_ZONE;
        scrollAt(sx, sy, -Math.round(depth * MAX_SCROLL));
      } else if (!keyboardOpen && sy > window.innerHeight - SCROLL_ZONE) {
        const depth = 1 - (window.innerHeight - sy) / SCROLL_ZONE;
        scrollAt(sx, sy, Math.round(depth * MAX_SCROLL));
      }

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
          triggerClick(target);
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
    } else {
      setTargetedElement(null);
      dwellTargetRef.current = null;
      dwellStartRef.current = 0;
      setDwellProgress(0);
    }
  }, [getClickableAtPoint, triggerClick]);

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
