import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { Modal, Spinner } from "react-bootstrap";
import { io } from "socket.io-client";
import { chatApi } from "../../services/api";
import {
    VOICE_ICE_SERVERS,
    getApiOrigin,
    getAuthTokenForSocket,
    getSelfDisplayName,
} from "./voiceCallUtils";

/** Routage messagerie aligné sur POST /chat/messages (patient seul, patient+staff, ou pair). */
function sendCallLogToThread(routing, bodyJson) {
    if (!routing) return Promise.resolve();
    if (routing.patientId && routing.peerRole && routing.peerId) {
        return chatApi.sendMessage({
            patientId: routing.patientId,
            peerRole: routing.peerRole,
            peerId: routing.peerId,
            body: bodyJson,
            kind: "call",
        });
    }
    if (routing.patientId && !routing.peerRole) {
        return chatApi.sendMessage({ patientId: routing.patientId, body: bodyJson, kind: "call" });
    }
    if (routing.peerRole && routing.peerId) {
        return chatApi.sendMessage({
            peerRole: routing.peerRole,
            peerId: routing.peerId,
            body: bodyJson,
            kind: "call",
        });
    }
    return Promise.resolve();
}

/** Détecte une offre WebRTC vidéo même si le champ socket `video` est absent (récepteur). */
function sdpOfferIndicatesVideo(offer) {
    if (!offer || typeof offer !== "object") return false;
    const sdp = typeof offer.sdp === "string" ? offer.sdp : "";
    return sdp.includes("m=video");
}

function cleanupPeer(pcRef, streamRef) {
    const pc = pcRef.current;
    if (pc) {
        try {
            pc.ontrack = null;
            pc.onicecandidate = null;
            pc.close();
        } catch {
            /* ignore */
        }
        pcRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }
}

/** @typedef {'audio' | 'video'} CallMediaMode */

/**
 * Signalisation Socket.IO (/voice) + WebRTC audio ou vidéo 1:1.
 */
const VoiceCallLayer = forwardRef(function VoiceCallLayer({ session, peerContext, onAfterCallLogged }, ref) {
    const [phase, setPhase] = useState("idle");
    const [pendingIncoming, setPendingIncoming] = useState(null);
    const [errorHint, setErrorHint] = useState(null);
    /** audio = appel vocal ; video = visio (caméra + micro). */
    const [mediaMode, setMediaMode] = useState(/** @type {CallMediaMode} */ ("audio"));
    const [camOff, setCamOff] = useState(false);

    const phaseRef = useRef(phase);
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    const socketRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callMediaRef = useRef(/** @type {CallMediaMode} */ ("audio"));
    const roomIdRef = useRef(null);
    const remoteUserIdRef = useRef(null);
    const callRecordMediaRecorderRef = useRef(null);
    const callRecordChunksRef = useRef([]);
    const callRecordAudioContextRef = useRef(null);
    /** Si défini, `runHangupBody` est appelé après l’arrêt de l’enregistrement (fichier téléchargé). */
    const pendingHangupAfterRecordRef = useRef(null);
    const connectedAtRef = useRef(null);
    /** Flux distant si ontrack arrive avant le montage du <video> (récepteur / appelant). */
    const pendingRemoteStreamRef = useRef(null);

    const [micMuted, setMicMuted] = useState(false);
    const [callRecording, setCallRecording] = useState(false);
    /** Affichage MM:SS uniquement une fois la communication établie (appelant ou appelé). */
    const [callTimerLabel, setCallTimerLabel] = useState("00:00");

    const runHangupBody = useCallback((notifyPeer) => {
        connectedAtRef.current = null;
        setMicMuted(false);
        setCamOff(false);
        setCallRecording(false);
        setMediaMode("audio");
        callMediaRef.current = "audio";
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        pendingRemoteStreamRef.current = null;
        const remote = remoteUserIdRef.current;
        const room = roomIdRef.current;
        const s = socketRef.current;
        if (notifyPeer && s?.connected && remote) {
            s.emit("voice:hangup", { toUserId: remote, roomId: room });
        }
        cleanupPeer(pcRef, localStreamRef);
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        roomIdRef.current = null;
        remoteUserIdRef.current = null;
        setPendingIncoming(null);
        setPhase("idle");
        setErrorHint(null);
    }, []);

    useEffect(() => {
        if (phase !== "connected") {
            setCallTimerLabel("00:00");
            return undefined;
        }
        const tick = () => {
            const start = connectedAtRef.current;
            if (!start) return;
            const sec = Math.floor((Date.now() - start) / 1000);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            setCallTimerLabel(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [phase]);

    /** Si la session locale a une piste vidéo, forcer l’UI visio (filet de sécurité récepteur). */
    useEffect(() => {
        if (phase !== "connected") return;
        const stream = localStreamRef.current;
        if (stream?.getVideoTracks().length) {
            setMediaMode("video");
            callMediaRef.current = "video";
        }
    }, [phase]);

    /** Attache le flux distant au <video> même si ontrack arrive avant le montage React du popup. */
    const attachRemoteVideoStream = useCallback((rs) => {
        if (!rs) return;
        pendingRemoteStreamRef.current = rs;
        const tryAttach = () => {
            const el = remoteVideoRef.current;
            if (!el || !pendingRemoteStreamRef.current) return false;
            el.srcObject = pendingRemoteStreamRef.current;
            el.play().catch(() => {});
            pendingRemoteStreamRef.current = null;
            return true;
        };
        if (tryAttach()) return;
        requestAnimationFrame(() => {
            if (tryAttach()) return;
            requestAnimationFrame(() => {
                tryAttach();
            });
        });
    }, []);

    const handleRemoteTrack = useCallback((ev) => {
        let rs = ev.streams[0];
        if (!rs && ev.track) rs = new MediaStream([ev.track]);
        if (!rs) return;
        if (callMediaRef.current === "video") {
            attachRemoteVideoStream(rs);
        } else if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = rs;
            remoteAudioRef.current.play().catch(() => {});
        }
    }, [attachRemoteVideoStream]);

    /** Après paint : aperçu local + dernier flux distant en attente (récepteur). */
    useLayoutEffect(() => {
        if (mediaMode !== "video") return;
        if (phase !== "connected" && phase !== "outgoing") return;
        const ls = localStreamRef.current;
        const lv = localVideoRef.current;
        if (ls && lv) {
            lv.srcObject = ls;
            lv.play().catch(() => {});
        }
        const pending = pendingRemoteStreamRef.current;
        const rv = remoteVideoRef.current;
        if (pending && rv) {
            rv.srcObject = pending;
            rv.play().catch(() => {});
            pendingRemoteStreamRef.current = null;
        }
    }, [phase, mediaMode]);

    const enqueueHangup = useCallback(
        (notifyPeer) => {
            const ph = phaseRef.current;
            const t0 = connectedAtRef.current;
            const routing = peerContext?.routing;
            if (notifyPeer && routing) {
                let outcome = "cancelled";
                let durationSec;
                if (ph === "connected") {
                    outcome = "ended";
                    durationSec = t0 != null ? Math.max(0, Math.floor((Date.now() - t0) / 1000)) : 0;
                } else if (ph === "outgoing" || ph === "ringing") {
                    outcome = "cancelled";
                }
                const bodyJson = JSON.stringify({ outcome, durationSec });
                void sendCallLogToThread(routing, bodyJson)
                    .then(() => onAfterCallLogged?.())
                    .catch((e) => console.warn("Historique appel", e));
            }
            runHangupBody(notifyPeer);
        },
        [peerContext, runHangupBody, onAfterCallLogged],
    );

    const hangup = useCallback(
        (notifyPeer) => {
            const mr = callRecordMediaRecorderRef.current;
            if (mr && mr.state === "recording") {
                pendingHangupAfterRecordRef.current = { notifyPeer };
                try {
                    mr.stop();
                } catch {
                    pendingHangupAfterRecordRef.current = null;
                    enqueueHangup(notifyPeer);
                }
                return;
            }
            if (callRecordAudioContextRef.current) {
                try {
                    callRecordAudioContextRef.current.close();
                } catch {
                    /* ignore */
                }
                callRecordAudioContextRef.current = null;
            }
            callRecordChunksRef.current = [];
            enqueueHangup(notifyPeer);
        },
        [enqueueHangup],
    );

    const toggleMicMute = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const nextMuted = !micMuted;
        stream.getAudioTracks().forEach((t) => {
            t.enabled = !nextMuted;
        });
        setMicMuted(nextMuted);
    }, [micMuted]);

    const toggleCam = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const next = !camOff;
        stream.getVideoTracks().forEach((t) => {
            t.enabled = !next;
        });
        setCamOff(next);
    }, [camOff]);

    const toggleCallRecording = useCallback(() => {
        if (!callRecording) {
            const local = localStreamRef.current;
            const remote =
                remoteAudioRef.current?.srcObject || remoteVideoRef.current?.srcObject;
            if (!local || !remote) {
                setErrorHint("Flux audio incomplet — patientez encore un instant.");
                return;
            }
            try {
                const ctx = new AudioContext();
                callRecordAudioContextRef.current = ctx;
                const dest = ctx.createMediaStreamDestination();
                ctx.createMediaStreamSource(local).connect(dest);
                ctx.createMediaStreamSource(remote).connect(dest);
                callRecordChunksRef.current = [];
                let mimeType = "audio/webm";
                if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                    mimeType = "audio/webm;codecs=opus";
                } else if (!MediaRecorder.isTypeSupported("audio/webm")) {
                    setErrorHint("Enregistrement non supporté sur ce navigateur.");
                    try {
                        ctx.close();
                    } catch {
                        /* ignore */
                    }
                    callRecordAudioContextRef.current = null;
                    return;
                }
                const recorder = new MediaRecorder(dest.stream, { mimeType });
                callRecordMediaRecorderRef.current = recorder;
                recorder.ondataavailable = (e) => {
                    if (e.data.size) callRecordChunksRef.current.push(e.data);
                };
                recorder.onstop = () => {
                    const chunks = callRecordChunksRef.current;
                    if (chunks.length) {
                        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `medifollow-appel-${Date.now()}.webm`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                    }
                    callRecordChunksRef.current = [];
                    const c = callRecordAudioContextRef.current;
                    if (c) {
                        c.close().catch(() => {});
                        callRecordAudioContextRef.current = null;
                    }
                    setCallRecording(false);
                    callRecordMediaRecorderRef.current = null;
                    const pending = pendingHangupAfterRecordRef.current;
                    pendingHangupAfterRecordRef.current = null;
                    if (pending) {
                        enqueueHangup(pending.notifyPeer);
                    }
                };
                recorder.start(1000);
                ctx.resume().catch(() => {});
                setCallRecording(true);
            } catch (e) {
                console.error(e);
                setErrorHint("Enregistrement impossible sur ce navigateur.");
            }
        } else {
            pendingHangupAfterRecordRef.current = null;
            const mr = callRecordMediaRecorderRef.current;
            if (mr && mr.state !== "inactive") {
                try {
                    mr.stop();
                } catch {
                    /* ignore */
                }
            }
        }
    }, [callRecording, enqueueHangup]);

    useEffect(() => {
        if (!session?.id) return undefined;
        const token = getAuthTokenForSocket();
        if (!token) return undefined;

        const origin = getApiOrigin();
        const s = io(`${origin}/voice`, {
            auth: { token: `Bearer ${token}` },
            transports: ["websocket", "polling"],
            reconnection: true,
        });
        socketRef.current = s;

        const onIncoming = (payload) => {
            const ph = phaseRef.current;
            if (ph !== "idle" && ph !== "ringing") return;
            if (!payload?.fromUserId || !payload?.offer) return;
            const isVideo = !!payload.video || sdpOfferIndicatesVideo(payload.offer);
            setMediaMode(isVideo ? "video" : "audio");
            callMediaRef.current = isVideo ? "video" : "audio";
            setPendingIncoming({
                roomId: payload.roomId,
                fromUserId: payload.fromUserId,
                callerName: payload.callerName || "Appel",
                offer: payload.offer,
                video: isVideo,
            });
            setPhase("ringing");
        };

        const onIncomingAnswer = async (payload) => {
            if (!payload?.answer || !payload?.fromUserId) return;
            if (roomIdRef.current && payload.roomId && payload.roomId !== roomIdRef.current) return;
            const pc = pcRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                connectedAtRef.current = Date.now();
                setPhase("connected");
            } catch (e) {
                console.error(e);
                setErrorHint("Échec de la connexion");
                hangup(false);
            }
        };

        const onIce = async (payload) => {
            if (!payload?.candidate || !payload?.fromUserId) return;
            const pc = pcRef.current;
            if (!pc) return;
            const peer = remoteUserIdRef.current;
            if (peer && payload.fromUserId !== peer) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
                console.warn("ICE", e);
            }
        };

        const onRejected = () => {
            setErrorHint("Appel refusé");
            hangup(false);
        };

        const onRemoteHangup = () => {
            hangup(false);
        };

        s.on("voice:incoming", onIncoming);
        s.on("voice:incoming-answer", onIncomingAnswer);
        s.on("voice:ice", onIce);
        s.on("voice:rejected", onRejected);
        s.on("voice:hangup", onRemoteHangup);

        return () => {
            s.off("voice:incoming", onIncoming);
            s.off("voice:incoming-answer", onIncomingAnswer);
            s.off("voice:ice", onIce);
            s.off("voice:rejected", onRejected);
            s.off("voice:hangup", onRemoteHangup);
            s.disconnect();
            socketRef.current = null;
            cleanupPeer(pcRef, localStreamRef);
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = null;
            }
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            pendingRemoteStreamRef.current = null;
            roomIdRef.current = null;
            remoteUserIdRef.current = null;
        };
    }, [session?.id, hangup]);

    useEffect(() => {
        const ph = phaseRef.current;
        if (ph === "idle" || ph === "ringing") return;
        if (!peerContext?.roomId) {
            hangup(true);
            return;
        }
        if (roomIdRef.current && peerContext.roomId !== roomIdRef.current) {
            hangup(true);
        }
    }, [peerContext?.roomId, hangup]);

    const startOutgoing = useCallback(async (opts = {}) => {
        const isVideo = !!opts.video;
        if (!peerContext?.remoteUserId || !peerContext?.roomId) return;
        const s = socketRef.current;
        if (!s?.connected) {
            setErrorHint("Signalisation indisponible (reconnexion…)");
            return;
        }
        if (phaseRef.current !== "idle") return;

        connectedAtRef.current = null;
        setMediaMode(isVideo ? "video" : "audio");
        callMediaRef.current = isVideo ? "video" : "audio";
        setPhase("outgoing");
        setErrorHint(null);
        roomIdRef.current = peerContext.roomId;
        remoteUserIdRef.current = peerContext.remoteUserId;

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                isVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true },
            );
            localStreamRef.current = stream;
            const pc = new RTCPeerConnection({ iceServers: VOICE_ICE_SERVERS });
            pcRef.current = pc;

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate && peerContext.remoteUserId) {
                    s.emit("voice:ice", {
                        roomId: peerContext.roomId,
                        toUserId: peerContext.remoteUserId,
                        candidate: e.candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = handleRemoteTrack;

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: isVideo,
            });
            await pc.setLocalDescription(offer);

            s.emit("voice:invite", {
                roomId: peerContext.roomId,
                toUserId: peerContext.remoteUserId,
                offer: pc.localDescription,
                callerName: getSelfDisplayName(session),
                video: isVideo,
            });
            if (isVideo && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(() => {});
            }
        } catch (e) {
            console.error(e);
            setErrorHint(
                isVideo ? "Caméra ou micro inaccessible / refusé" : "Microphone inaccessible ou refusé",
            );
            hangup(false);
        }
    }, [peerContext, session, hangup, handleRemoteTrack]);

    const acceptIncoming = useCallback(async () => {
        const p = pendingIncoming;
        const s = socketRef.current;
        if (!p || !s?.connected) return;

        const { roomId, fromUserId, offer, video: wantVideo } = p;
        const isVideo = !!wantVideo || sdpOfferIndicatesVideo(offer);
        setMediaMode(isVideo ? "video" : "audio");
        callMediaRef.current = isVideo ? "video" : "audio";
        roomIdRef.current = roomId;
        remoteUserIdRef.current = fromUserId;
        setPendingIncoming(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                isVideo ? { audio: true, video: { facingMode: "user" } } : { audio: true },
            );
            localStreamRef.current = stream;
            const pc = new RTCPeerConnection({ iceServers: VOICE_ICE_SERVERS });
            pcRef.current = pc;

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    s.emit("voice:ice", {
                        roomId,
                        toUserId: fromUserId,
                        candidate: e.candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = handleRemoteTrack;

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            s.emit("voice:answer", {
                roomId,
                toUserId: fromUserId,
                answer: pc.localDescription,
            });
            connectedAtRef.current = Date.now();
            setPhase("connected");
            if (isVideo && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(() => {});
            }
        } catch (e) {
            console.error(e);
            setErrorHint(
                isVideo ? "Impossible d’accepter (caméra / micro)" : "Impossible d’accepter l’appel",
            );
            hangup(false);
        }
    }, [pendingIncoming, hangup, handleRemoteTrack]);

    const rejectIncoming = useCallback(() => {
        const p = pendingIncoming;
        const s = socketRef.current;
        if (p?.fromUserId && s?.connected) {
            s.emit("voice:reject", { toUserId: p.fromUserId, roomId: p.roomId });
        }
        void (async () => {
            try {
                if (peerContext?.routing) {
                    await sendCallLogToThread(peerContext.routing, JSON.stringify({ outcome: "declined" }));
                    onAfterCallLogged?.();
                }
            } catch (e) {
                console.warn("Historique appel", e);
            }
        })();
        setMediaMode("audio");
        callMediaRef.current = "audio";
        setPendingIncoming(null);
        setPhase("idle");
    }, [pendingIncoming, peerContext, onAfterCallLogged]);

    useImperativeHandle(
        ref,
        () => ({
            startOutgoing,
            startVideoCall: () => startOutgoing({ video: true }),
        }),
        [startOutgoing],
    );

    const voiceModalOpen = phase === "outgoing" || phase === "ringing" || phase === "connected";

    const handleVoiceModalHide = () => {
        if (phase === "ringing") rejectIncoming();
        else hangup(true);
    };

    return (
        <>
            <audio ref={remoteAudioRef} autoPlay playsInline className="d-none" />

            {/* Une seule modale pour entrant, sortant et communication */}
            <Modal
                show={voiceModalOpen}
                onHide={handleVoiceModalHide}
                centered
                backdrop="static"
                keyboard
                className={`voice-call-modal-unified ${mediaMode === "video" ? "voice-call-modal--video" : ""}`}
                dialogClassName={`voice-call-modal__dialog ${mediaMode === "video" ? "voice-call-modal__dialog--video" : ""}`}
                contentClassName="voice-call-modal__content"
                aria-labelledby="voice-call-modal-title"
            >
                <Modal.Body
                    className={`voice-call-modal__body text-center position-relative ${
                        mediaMode === "video" && (phase === "outgoing" || phase === "connected")
                            ? "voice-call-modal__body--video p-0"
                            : ""
                    }`}
                >
                    {phase === "ringing" && (
                        <>
                            <button
                                type="button"
                                className="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2"
                                onClick={rejectIncoming}
                                aria-label="Refuser l’appel"
                                style={{ zIndex: 2 }}
                            />
                            <div className="voice-call-modal__avatar voice-call-modal__avatar--ring mb-3">
                                <i
                                    className={pendingIncoming?.video ? "ri-vidicon-fill text-white" : "ri-phone-fill text-white"}
                                    style={{ fontSize: "1.65rem" }}
                                    aria-hidden
                                />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                {pendingIncoming?.video ? "Appel vidéo entrant" : "Appel entrant"}
                            </p>
                            <p className="voice-call-modal__subtitle small mb-4">
                                <strong className="text-white">{pendingIncoming?.callerName || "Contact"}</strong>
                                <br />
                                {pendingIncoming?.video ? (
                                    <>souhaite un <strong>appel vidéo</strong>.</>
                                ) : (
                                    <>souhaite un appel vocal.</>
                                )}
                            </p>
                            <div className="d-flex flex-wrap gap-2 justify-content-center">
                                <button
                                    type="button"
                                    className="voice-call-btn voice-call-btn--secondary-outline"
                                    onClick={rejectIncoming}
                                >
                                    Refuser
                                </button>
                                <button
                                    type="button"
                                    className="voice-call-btn voice-call-btn--primary-accept"
                                    onClick={acceptIncoming}
                                >
                                    <i className={pendingIncoming?.video ? "ri-vidicon-fill" : "ri-phone-fill"} aria-hidden />
                                    Accepter
                                </button>
                            </div>
                        </>
                    )}

                    {mediaMode === "video" && (phase === "outgoing" || phase === "connected") && (
                        <div className={`voice-call-modal__video-wrap ${phase === "outgoing" ? "is-outgoing" : "is-live"}`}>
                            <video ref={remoteVideoRef} className="voice-call-modal__remote" playsInline autoPlay />
                            <video ref={localVideoRef} className="voice-call-modal__local" playsInline autoPlay muted />
                            <div className="voice-call-modal__video-overlay">
                                {phase === "outgoing" && (
                                    <>
                                        <Spinner animation="border" role="status" variant="light" className="mb-2" />
                                        <p className="voice-call-modal__title mb-1 fw-semibold">Appel vidéo</p>
                                        <p className="voice-call-modal__subtitle small mb-3">
                                            Connexion à{" "}
                                            <strong className="text-white">{peerContext?.label || "…"}</strong>…
                                        </p>
                                        <div className="voice-call-toolbar">
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleMicMute}
                                                title={micMuted ? "Réactiver le micro" : "Couper le micro"}
                                            >
                                                <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                            </button>
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${camOff ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleCam}
                                                title={camOff ? "Réactiver la caméra" : "Couper la caméra"}
                                            >
                                                <i className={camOff ? "ri-camera-off-line" : "ri-camera-line"} aria-hidden />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="voice-call-btn voice-call-btn--hangup mt-2"
                                            onClick={() => hangup(true)}
                                            title="Raccrocher"
                                            aria-label="Raccrocher"
                                        >
                                            <i
                                                className="ri-phone-fill me-2"
                                                style={{ transform: "rotate(135deg)" }}
                                                aria-hidden
                                            />
                                            Raccrocher
                                        </button>
                                    </>
                                )}
                                {phase === "connected" && (
                                    <>
                                        <p className="voice-call-modal__title mb-1 fw-semibold">Visioconférence</p>
                                        <p
                                            className="voice-call-modal__timer mb-1"
                                            aria-label="Durée de l’appel"
                                            aria-live="polite"
                                        >
                                            {callTimerLabel}
                                        </p>
                                        <p className="voice-call-modal__subtitle small mb-2">
                                            avec <strong className="text-white">{peerContext?.label || "…"}</strong>
                                        </p>
                                        <div className="voice-call-toolbar">
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleMicMute}
                                                title={micMuted ? "Réactiver le micro" : "Couper le micro"}
                                                aria-pressed={micMuted}
                                            >
                                                <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                                <span className="d-none d-sm-inline">
                                                    {micMuted ? "Micro" : "Micro"}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${camOff ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                                onClick={toggleCam}
                                                title={camOff ? "Réactiver la caméra" : "Couper la caméra"}
                                                aria-pressed={camOff}
                                            >
                                                <i className={camOff ? "ri-camera-off-line" : "ri-camera-line"} aria-hidden />
                                                <span className="d-none d-sm-inline">Caméra</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`voice-call-btn ${callRecording ? "voice-call-btn--record-on" : "voice-call-btn--ghost"}`}
                                                onClick={toggleCallRecording}
                                                title={
                                                    callRecording
                                                        ? "Arrêter l’enregistrement et télécharger"
                                                        : "Enregistrer la conversation (audio)"
                                                }
                                                aria-pressed={callRecording}
                                            >
                                                <i
                                                    className={callRecording ? "ri-stop-circle-fill" : "ri-record-circle-line"}
                                                    aria-hidden
                                                />
                                                <span className="d-none d-sm-inline">
                                                    {callRecording ? "Stop" : "Enreg."}
                                                </span>
                                            </button>
                                        </div>
                                        <p className="voice-call-modal__hint mb-2">
                                            Enregistrement : audio .webm (mix des deux voix).
                                        </p>
                                        <button
                                            type="button"
                                            className="voice-call-btn voice-call-btn--hangup"
                                            onClick={() => hangup(true)}
                                            title="Raccrocher"
                                            aria-label="Raccrocher"
                                        >
                                            <i
                                                className="ri-phone-fill me-2"
                                                style={{ transform: "rotate(135deg)" }}
                                                aria-hidden
                                            />
                                            Raccrocher
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {phase === "outgoing" && mediaMode === "audio" && (
                        <>
                            <div className="voice-call-modal__avatar voice-call-modal__avatar--ring mb-3">
                                <Spinner animation="border" role="status" variant="light" />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                Appel en cours
                            </p>
                            <p className="voice-call-modal__subtitle small mb-3">
                                Connexion à <strong className="text-white">{peerContext?.label || "…"}</strong>…
                            </p>
                            <div className="voice-call-toolbar">
                                <button
                                    type="button"
                                    className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                    onClick={toggleMicMute}
                                    title={micMuted ? "Réactiver le micro" : "Couper le micro"}
                                >
                                    <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                    <span className="d-none d-sm-inline">
                                        {micMuted ? "Micro coupé" : "Micro"}
                                    </span>
                                </button>
                            </div>
                            <button
                                type="button"
                                className="voice-call-btn voice-call-btn--hangup"
                                onClick={() => hangup(true)}
                                title="Raccrocher"
                                aria-label="Raccrocher"
                            >
                                <i className="ri-phone-fill me-2" style={{ transform: "rotate(135deg)" }} aria-hidden />
                                Raccrocher
                            </button>
                        </>
                    )}

                    {phase === "connected" && mediaMode === "audio" && (
                        <>
                            <div className="voice-call-modal__avatar mb-3">
                                <i className="ri-phone-fill text-white" style={{ fontSize: "1.85rem" }} aria-hidden />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                En communication
                            </p>
                            <p
                                className="voice-call-modal__timer mb-2"
                                aria-label="Durée de l’appel"
                                aria-live="polite"
                            >
                                {callTimerLabel}
                            </p>
                            <p className="voice-call-modal__subtitle small mb-3">
                                avec <strong className="text-white">{peerContext?.label || "…"}</strong>
                            </p>
                            <div className="voice-call-toolbar">
                                <button
                                    type="button"
                                    className={`voice-call-btn ${micMuted ? "voice-call-btn--accent" : "voice-call-btn--ghost"}`}
                                    onClick={toggleMicMute}
                                    title={micMuted ? "Réactiver le micro" : "Couper le micro"}
                                    aria-pressed={micMuted}
                                >
                                    <i className={micMuted ? "ri-mic-off-line" : "ri-mic-line"} aria-hidden />
                                    <span className="d-none d-sm-inline">
                                        {micMuted ? "Micro coupé" : "Micro"}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className={`voice-call-btn ${callRecording ? "voice-call-btn--record-on" : "voice-call-btn--ghost"}`}
                                    onClick={toggleCallRecording}
                                    title={
                                        callRecording
                                            ? "Arrêter l’enregistrement et télécharger"
                                            : "Enregistrer la conversation (mix des deux voix)"
                                    }
                                    aria-pressed={callRecording}
                                >
                                    <i
                                        className={callRecording ? "ri-stop-circle-fill" : "ri-record-circle-line"}
                                        aria-hidden
                                    />
                                    <span className="d-none d-sm-inline">
                                        {callRecording ? "Arrêter l’enreg." : "Enregistrer"}
                                    </span>
                                </button>
                            </div>
                            <p className="voice-call-modal__hint mb-3">
                                Enregistrement : fichier .webm (voix locale + distante).
                            </p>
                            <button
                                type="button"
                                className="voice-call-btn voice-call-btn--hangup"
                                onClick={() => hangup(true)}
                                title="Raccrocher"
                                aria-label="Raccrocher"
                            >
                                <i className="ri-phone-fill me-2" style={{ transform: "rotate(135deg)" }} aria-hidden />
                                Raccrocher
                            </button>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {errorHint && (
                <div
                    className="alert alert-warning py-2 small mb-0 position-fixed top-0 start-50 translate-middle-x mt-2"
                    style={{ zIndex: 1070 }}
                >
                    {errorHint}
                    <button type="button" className="btn btn-sm btn-link ms-2 p-0" onClick={() => setErrorHint(null)}>
                        OK
                    </button>
                </div>
            )}
        </>
    );
});

export default VoiceCallLayer;

export function VoiceCallButton({ voiceCallEnabled, onVoiceCall, disabled }) {
    if (!voiceCallEnabled) return null;
    return (
        <button
            type="button"
            className="btn btn-icon btn-sm rounded-circle btn-primary-subtle text-primary ms-2"
            title="Appel vocal"
            aria-label="Appel vocal"
            disabled={disabled}
            onClick={() => onVoiceCall?.()}
        >
            <i className="ri-phone-fill" style={{ fontSize: "1.15rem" }} />
        </button>
    );
}
