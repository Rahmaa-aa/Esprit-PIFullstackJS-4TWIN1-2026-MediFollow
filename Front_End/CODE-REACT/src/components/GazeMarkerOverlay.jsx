import { useHandGesture } from "../context/HandGestureContext";

/** Point rouge = position « souris » pour le clic au clignement (approx. iris MediaPipe). */
const GazeMarkerOverlay = () => {
  const { eyeTrackingEnabled, gazePosition } = useHandGesture();

  if (!eyeTrackingEnabled || !gazePosition) return null;

  const { x, y } = gazePosition;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: 14,
        height: 14,
        marginLeft: -7,
        marginTop: -7,
        borderRadius: "50%",
        background: "#e63946",
        boxShadow: "0 0 0 2px #fff, 0 0 6px rgba(0,0,0,0.45)",
        pointerEvents: "none",
        zIndex: 299997,
      }}
    />
  );
};

export default GazeMarkerOverlay;
