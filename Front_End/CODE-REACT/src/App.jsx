import React, { Fragment } from "react";

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
    <AuthProvider>
      <HandGestureProvider>
        <div className="App">{children}</div>
        <HandGestureOverlay />
        <VirtualKeyboard />
      </HandGestureProvider>
    </AuthProvider>
  )
}

export default App
