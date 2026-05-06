import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n.js";

// Redux Selector / Action
import { useDispatch } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { HandGestureProvider, useHandGesture } from "./context/HandGestureContext";
import HandGestureOverlay from "./components/HandGestureOverlay";
import GazeMarkerOverlay from "./components/GazeMarkerOverlay";
import EyeCalibrationModal from "./components/EyeCalibrationModal";
import VirtualKeyboard from "./components/VirtualKeyboard";
import { VoiceCallBridgeProvider } from "./context/VoiceCallBridgeContext";

// import state selectors
import {
  setSetting
} from "./store/setting/actions";

function EyeCalibrationModalLayer() {
  const {
    eyeCalibrationModalOpen,
    dismissEyeCalibrationModal,
    applyEyeCalibration,
  } = useHandGesture();

  return (
    <EyeCalibrationModal
      show={eyeCalibrationModalOpen}
      onHide={dismissEyeCalibrationModal}
      onComplete={applyEyeCalibration}
    />
  );
}

function App({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSetting());
  }, [dispatch]);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <VoiceCallBridgeProvider>
          <HandGestureProvider>
            <div className="App">{children}</div>
            <HandGestureOverlay />
            <GazeMarkerOverlay />
            <EyeCalibrationModalLayer />
            <VirtualKeyboard />
          </HandGestureProvider>
        </VoiceCallBridgeProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
