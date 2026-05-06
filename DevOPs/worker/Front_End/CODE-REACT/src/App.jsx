import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n.js";

// Redux Selector / Action
import { useDispatch } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { HandGestureProvider } from "./context/HandGestureContext";
import HandGestureOverlay from "./components/HandGestureOverlay";
import VirtualKeyboard from "./components/VirtualKeyboard";
import { VoiceCallBridgeProvider } from "./context/VoiceCallBridgeContext";

// import state selectors
import {
  setSetting
} from "./store/setting/actions";


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
            <VirtualKeyboard />
          </HandGestureProvider>
        </VoiceCallBridgeProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
