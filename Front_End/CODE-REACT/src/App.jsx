import React, { Fragment } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n.js";

// Redux Selector / Action
import { useDispatch } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { HandGestureProvider } from "./context/HandGestureContext";
import HandGestureOverlay from "./components/HandGestureOverlay";
import VirtualKeyboard from "./components/VirtualKeyboard";

// import state selectors
import {
  setSetting
} from "./store/setting/actions";


function App({ children }) {
  const dispatch = useDispatch();
  dispatch(setSetting());
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <HandGestureProvider>
          <div className="App">{children}</div>
          <HandGestureOverlay />
          <VirtualKeyboard />
        </HandGestureProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
