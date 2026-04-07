import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import {
  VOICE_ICE_SERVERS,
  getApiOrigin,
  getAuthTokenForSocket,
  getSelfDisplayName,
} from "../views/chat/voiceCallUtils";
import { startIncomingRingtone, startOutgoingRingback } from "../views/chat/callRingtone";
import "./GlobalCallLayer.css";

/* ── helpers ────────────────────────────────────────────────────── */
function getSession() {
  try {
    if (localStorage.getItem("adminUser")) {
      const u = JSON.parse(localStorage.getItem("adminUser"));
      if (u?.role === "carecoordinator")
        return { id: String(u.id || u._id || ""), role: "carecoordinator" };
    }
    if (localStorage.getItem("patientUser")) {
      const u = JSON.parse(localStorage.getItem("patientUser"));
      return { id: String(u.id || u._id || ""), role: "patient" };
    }
    if (localStorage.getItem("doctorUser")) {
      const u = JSON.parse(localStorage.getItem("doctorUser"));
      return { id: String(u.id || u._id || ""), role: "doctor" };
    }
    if (localStorage.getItem("nurseUser")) {
      const u = JSON.parse(localStorage.getItem("nurseUser"));
      return { id: String(u.id || u._id || ""), role: "nurse" };
    }
  } catch { /* ignore */ }
  return null;
}

function sdpHasVideo(offer) {
  if (!offer || typeof offer !== "object") return false;
  const sdp = typeof offer.sdp === "string" ? offer.sdp : "";
  return sdp.includes("m=video");
}

function cleanupPeer(pcRef, streamRef) {
  if (pcRef.current) {
    try { pcRef.current.close(); } catch { /* */ }
    pcRef.current = null;
  }
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
}

/* ── COMPONENT ──────────────────────────────────────────────────── */
export default function GlobalCallLayer() {
  const { t } = useTranslation();
  const [session, setSession] = useState(getSession);

  /* Re-detect session on storage changes (login/logout) */
  useEffect(() => {
    const onStorage = () => setSession(getSession());
    window.addEventListener("storage", onStorage);
    const id = setInterval(() => {
      const s = getSession();
      setSession((prev) =>
        prev?.id === s?.id && prev?.role === s?.role ? prev : s
      );
    }, 2000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(id); };
  }, []);

  /* States */
  const [phase, setPhase] = useState("idle"); // idle | ringing | outgoing | connected
  const [mediaMode, setMediaMode] = useState("video"); // audio | video
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [timerLabel, setTimerLabel] = useState("00:00");
  const [callerInfo, setCallerInfo] = useState(null); // { name, fromUserId }
  const [errorMsg, setErrorMsg] = useState(null);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const connectedAtRef = useRef(null);
  const roomIdRef = useRef(null);
  const remoteUserIdRef = useRef(null);
  const pendingOfferRef = useRef(null);

  /* ── Ringtones ── */
  useEffect(() => {
    if (phase === "ringing") return startIncomingRingtone(mediaMode === "video");
  }, [phase, mediaMode]);
  useEffect(() => {
    if (phase === "outgoing") return startOutgoingRingback(mediaMode === "video");
  }, [phase, mediaMode]);

  /* ── Call timer ── */
  useEffect(() => {
    if (phase !== "connected") { setTimerLabel("00:00"); return; }
    const tick = () => {
      const s = connectedAtRef.current;
      if (!s) return;
      const sec = Math.floor((Date.now() - s) / 1000);
      setTimerLabel(`${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase]);

  /* ── Attach streams to video elements ── */
  useEffect(() => {
    if (phase !== "connected" && phase !== "outgoing") return;
    const ls = localStreamRef.current;
    const lv = localVideoRef.current;
    if (ls && lv) { lv.srcObject = ls; lv.play().catch(() => {}); }
  }, [phase, camOff]);

  /* ── Hangup ── */
  const hangup = useCallback((notifyPeer = true) => {
    const remote = remoteUserIdRef.current;
    const room = roomIdRef.current;
    const s = socketRef.current;
    if (notifyPeer && s?.connected && remote) {
      s.emit("voice:hangup", { toUserId: remote, roomId: room });
    }
    cleanupPeer(pcRef, localStreamRef);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    connectedAtRef.current = null;
    roomIdRef.current = null;
    remoteUserIdRef.current = null;
    pendingOfferRef.current = null;
    setPhase("idle");
    setMicMuted(false);
    setCamOff(false);
    setCallerInfo(null);
    setErrorMsg(null);
  }, []);

  /* ── Create RTCPeerConnection ── */
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: VOICE_ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate && remoteUserIdRef.current && socketRef.current?.connected) {
        socketRef.current.emit("voice:ice", {
          roomId: roomIdRef.current,
          toUserId: remoteUserIdRef.current,
          candidate: e.candidate.toJSON(),
        });
      }
    };
    pc.ontrack = (ev) => {
      const rs = ev.streams[0] || new MediaStream([ev.track]);
      if (mediaMode === "video" || rs.getVideoTracks().length) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = rs;
          remoteVideoRef.current.play().catch(() => {});
        }
      } else if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = rs;
        remoteAudioRef.current.play().catch(() => {});
      }
    };
    pcRef.current = pc;
    return pc;
  }, [mediaMode]);

  /* ── Accept incoming ── */
  const acceptCall = useCallback(async () => {
    const offer = pendingOfferRef.current;
    const info = callerInfo;
    const s = socketRef.current;
    if (!offer || !info || !s?.connected) return;

    const isVideo = sdpHasVideo(offer) || mediaMode === "video";
    setMediaMode(isVideo ? "video" : "audio");
    remoteUserIdRef.current = info.fromUserId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        isVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true }
      );
      localStreamRef.current = stream;
      const pc = createPC();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      s.emit("voice:answer", {
        roomId: roomIdRef.current,
        toUserId: info.fromUserId,
        answer: pc.localDescription,
      });
      connectedAtRef.current = Date.now();
      pendingOfferRef.current = null;
      setPhase("connected");
    } catch (e) {
      console.error(e);
      setErrorMsg(t("chat.voice.errorAcceptVideo", "Could not accept call"));
      hangup(false);
    }
  }, [callerInfo, mediaMode, createPC, hangup, t]);

  /* ── Reject incoming ── */
  const rejectCall = useCallback(() => {
    const info = callerInfo;
    const s = socketRef.current;
    if (info?.fromUserId && s?.connected) {
      s.emit("voice:reject", { toUserId: info.fromUserId, roomId: roomIdRef.current });
    }
    pendingOfferRef.current = null;
    setPhase("idle");
    setCallerInfo(null);
  }, [callerInfo]);

  /* ── Toggle mic ── */
  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !micMuted;
    stream.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setMicMuted(next);
  }, [micMuted]);

  /* ── Toggle camera ── */
  const toggleCam = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !camOff;
    stream.getVideoTracks().forEach((t) => { t.enabled = !next; });
    setCamOff(next);
  }, [camOff]);

  /* ── Socket connection ── */
  useEffect(() => {
    if (!session?.id) return;
    const token = getAuthTokenForSocket();
    if (!token) return;

    const origin = getApiOrigin();
    const s = io(`${origin}/voice`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = s;

    s.on("voice:incoming", (payload) => {
      if (phaseRef.current !== "idle") return;
      if (!payload?.fromUserId || !payload?.offer) return;
      const isVideo = !!payload.video || sdpHasVideo(payload.offer);
      setMediaMode(isVideo ? "video" : "audio");
      roomIdRef.current = payload.roomId;
      pendingOfferRef.current = payload.offer;
      setCallerInfo({
        name: payload.callerName || "Incoming Call",
        fromUserId: payload.fromUserId,
        video: isVideo,
      });
      setPhase("ringing");
    });

    s.on("voice:incoming-answer", async (payload) => {
      if (!payload?.answer) return;
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        connectedAtRef.current = Date.now();
        setPhase("connected");
      } catch (e) {
        console.error(e);
        hangup(false);
      }
    });

    s.on("voice:ice", async (payload) => {
      if (!payload?.candidate) return;
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch { /* */ }
    });

    s.on("voice:rejected", () => {
      setErrorMsg(t("chat.voice.errorCallRejected", "Call was rejected"));
      hangup(false);
    });

    s.on("voice:hangup", () => { hangup(false); });

    return () => {
      s.disconnect();
      socketRef.current = null;
      cleanupPeer(pcRef, localStreamRef);
    };
  }, [session?.id, hangup, t]);

  /* ── Public API: window.medifollow.startCall(userId, opts) ── */
  useEffect(() => {
    if (!window.medifollow) window.medifollow = {};
    window.medifollow.startCall = async (toUserId, opts = {}) => {
      if (!session?.id) return;
      if (phaseRef.current !== "idle") return;
      const s = socketRef.current;
      if (!s?.connected) { setErrorMsg("Signaling not connected"); return; }

      const isVideo = opts.video !== false;
      setMediaMode(isVideo ? "video" : "audio");
      setPhase("outgoing");
      setCallerInfo({ name: opts.peerName || "Contact", fromUserId: toUserId });
      const room = [
        `${session.role}:${session.id}`,
        `${opts.peerRole || "user"}:${toUserId}`,
      ].sort().join("|");
      roomIdRef.current = room;
      remoteUserIdRef.current = toUserId;

      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          isVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true }
        );
        localStreamRef.current = stream;
        const pc = createPC();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: isVideo });
        await pc.setLocalDescription(offer);
        s.emit("voice:invite", {
          roomId: room,
          toUserId,
          offer: pc.localDescription,
          callerName: getSelfDisplayName(session),
          video: isVideo,
        });
      } catch (e) {
        console.error(e);
        setErrorMsg(isVideo ? "Camera access denied" : "Microphone access denied");
        hangup(false);
      }
    };
    return () => { if (window.medifollow) delete window.medifollow.startCall; };
  }, [session, createPC, hangup]);

  /* ─── Don't render anything if not logged in ─── */
  if (!session?.id) return null;

  /* ─── IDLE: nothing visible ─── */
  if (phase === "idle" && !errorMsg) return <audio ref={remoteAudioRef} autoPlay playsInline className="d-none" />;

  /* ─── Error toast ─── */
  if (phase === "idle" && errorMsg) {
    return (
      <div className="gcl-error-toast">
        <i className="ri-error-warning-line me-2" />
        {errorMsg}
        <button className="btn btn-sm btn-link text-white ms-2 p-0" onClick={() => setErrorMsg(null)}>OK</button>
      </div>
    );
  }

  /* ─── INCOMING CALL (Messenger-style popup) ─── */
  if (phase === "ringing") {
    return (
      <>
        <audio ref={remoteAudioRef} autoPlay playsInline className="d-none" />
        <div className="gcl-backdrop" />
        <div className="gcl-incoming-popup">
          <div className="gcl-incoming-ring" />
          <div className="gcl-incoming-icon">
            <i className={callerInfo?.video ? "ri-vidicon-fill" : "ri-phone-fill"} />
          </div>
          <div className="gcl-incoming-info">
            <div className="gcl-incoming-label">
              {callerInfo?.video
                ? t("chat.voice.incomingVideo", "Incoming Video Call")
                : t("chat.voice.incomingAudio", "Incoming Call")}
            </div>
            <div className="gcl-incoming-name">{callerInfo?.name || "Unknown"}</div>
          </div>
          <div className="gcl-incoming-actions">
            <button className="gcl-btn gcl-btn-reject" onClick={rejectCall} title="Reject">
              <i className="ri-phone-fill" style={{ transform: "rotate(135deg)" }} />
            </button>
            <button className="gcl-btn gcl-btn-accept" onClick={acceptCall} title="Accept">
              <i className={callerInfo?.video ? "ri-vidicon-fill" : "ri-phone-fill"} />
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ─── OUTGOING + CONNECTED (Full-screen overlay) ─── */
  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline className="d-none" />
      <div className="gcl-fullscreen">
        {/* Remote video (full screen) */}
        <video
          ref={remoteVideoRef}
          className="gcl-remote-video"
          autoPlay
          playsInline
        />

        {/* Connecting overlay */}
        {phase === "outgoing" && (
          <div className="gcl-connecting-overlay">
            <div className="gcl-connecting-pulse" />
            <div className="gcl-connecting-icon">
              <i className={mediaMode === "video" ? "ri-vidicon-fill" : "ri-phone-fill"} />
            </div>
            <p className="gcl-connecting-text">
              {t("chat.voice.connectingLine", { name: callerInfo?.name || "..." })}
            </p>
            <p className="gcl-connecting-sub">
              {mediaMode === "video"
                ? t("chat.voice.outgoingVideo", "Starting video call...")
                : t("chat.voice.outgoingAudio", "Calling...")}
            </p>
          </div>
        )}

        {/* Top bar */}
        <div className="gcl-top-bar">
          <div className="gcl-caller-info">
            <span className="gcl-caller-name">{callerInfo?.name || "Contact"}</span>
            {phase === "connected" && (
              <span className="gcl-timer">{timerLabel}</span>
            )}
            {phase === "outgoing" && (
              <span className="gcl-status-text">{t("chat.voice.outgoingVideo", "Calling...")}</span>
            )}
          </div>
        </div>

        {/* Local video PiP */}
        {mediaMode === "video" && (
          <div className={`gcl-local-pip ${camOff ? "gcl-cam-off" : ""}`}>
            {camOff ? (
              <div className="gcl-cam-off-icon"><i className="ri-camera-off-fill" /></div>
            ) : (
              <video ref={localVideoRef} className="gcl-local-video" autoPlay playsInline muted />
            )}
          </div>
        )}

        {/* Bottom toolbar */}
        <div className="gcl-toolbar">
          <button
            className={`gcl-tool-btn ${micMuted ? "gcl-tool-active" : ""}`}
            onClick={toggleMic}
            title={micMuted ? "Unmute" : "Mute"}
          >
            <i className={micMuted ? "ri-mic-off-fill" : "ri-mic-fill"} />
            <span>{micMuted ? "Unmute" : "Mute"}</span>
          </button>

          {mediaMode === "video" && (
            <button
              className={`gcl-tool-btn ${camOff ? "gcl-tool-active" : ""}`}
              onClick={toggleCam}
              title={camOff ? "Camera On" : "Camera Off"}
            >
              <i className={camOff ? "ri-camera-off-fill" : "ri-camera-fill"} />
              <span>{camOff ? "Cam On" : "Cam Off"}</span>
            </button>
          )}

          <button
            className="gcl-tool-btn gcl-hangup-btn"
            onClick={() => hangup(true)}
            title="Hang Up"
          >
            <i className="ri-phone-fill" style={{ transform: "rotate(135deg)" }} />
            <span>End</span>
          </button>
        </div>
      </div>
    </>
  );
}
