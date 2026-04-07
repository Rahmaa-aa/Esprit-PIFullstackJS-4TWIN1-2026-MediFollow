import React, { Fragment, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n.js";

// Redux Selector / Action
import { useDispatch } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { HandGestureProvider } from "./context/HandGestureContext";
import HandGestureOverlay from "./components/HandGestureOverlay";
import VirtualKeyboard from "./components/VirtualKeyboard";
import VideoCallModal from './components/VideoCallModal';

// import state selectors
import {
  setSetting
} from "./store/setting/actions";


function App({ children }) {
  const dispatch = useDispatch();
  dispatch(setSetting());
  // Example state for demo/testing
  const [showVideo, setShowVideo] = useState(false);
  const selfId = 'user1'; // Replace with logged-in user ID
  const peerId = 'user2'; // Replace with selected user ID

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <HandGestureProvider>
          <div className="App">{children}</div>
          <HandGestureOverlay />
          <VirtualKeyboard />
          <button onClick={() => setShowVideo(true)}>Test Video Call</button>
          <VideoCallModal show={showVideo} onClose={() => setShowVideo(false)} selfId={selfId} peerId={peerId} />
        </HandGestureProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
