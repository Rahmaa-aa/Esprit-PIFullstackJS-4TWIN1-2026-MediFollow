import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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

/**
 * Signalisation Socket.IO (/voice) + WebRTC audio 1:1.
 */
const VoiceCallLayer = forwardRef(function VoiceCallLayer({ session, peerContext, onAfterCallLogged }, ref) {
    const [phase, setPhase] = useState("idle");
    const [pendingIncoming, setPendingIncoming] = useState(null);
    const [errorHint, setErrorHint] = useState(null);

    const phaseRef = useRef(phase);
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    const socketRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const roomIdRef = useRef(null);
    const remoteUserIdRef = useRef(null);
    const callRecordMediaRecorderRef = useRef(null);
    const callRecordChunksRef = useRef([]);
    const callRecordAudioContextRef = useRef(null);
    /** Si défini, `runHangupBody` est appelé après l’arrêt de l’enregistrement (fichier téléchargé). */
    const pendingHangupAfterRecordRef = useRef(null);
    const connectedAtRef = useRef(null);

    const [micMuted, setMicMuted] = useState(false);
    const [callRecording, setCallRecording] = useState(false);
    /** Affichage MM:SS uniquement une fois la communication établie (appelant ou appelé). */
    const [callTimerLabel, setCallTimerLabel] = useState("00:00");

    const runHangupBody = useCallback((notifyPeer) => {
        connectedAtRef.current = null;
        setMicMuted(false);
        setCallRecording(false);
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

    const toggleCallRecording = useCallback(() => {
        if (!callRecording) {
            const local = localStreamRef.current;
            const remote = remoteAudioRef.current?.srcObject;
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
            setPendingIncoming({
                roomId: payload.roomId,
                fromUserId: payload.fromUserId,
                callerName: payload.callerName || "Appel",
                offer: payload.offer,
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

    const startOutgoing = useCallback(async () => {
        if (!peerContext?.remoteUserId || !peerContext?.roomId) return;
        const s = socketRef.current;
        if (!s?.connected) {
            setErrorHint("Signalisation indisponible (reconnexion…)");
            return;
        }
        if (phaseRef.current !== "idle") return;

        connectedAtRef.current = null;
        setPhase("outgoing");
        setErrorHint(null);
        roomIdRef.current = peerContext.roomId;
        remoteUserIdRef.current = peerContext.remoteUserId;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

            pc.ontrack = (ev) => {
                if (remoteAudioRef.current && ev.streams[0]) {
                    remoteAudioRef.current.srcObject = ev.streams[0];
                    remoteAudioRef.current.play().catch(() => {});
                }
            };

            const offer = await pc.createOffer({ offerToReceiveAudio: true });
            await pc.setLocalDescription(offer);

            s.emit("voice:invite", {
                roomId: peerContext.roomId,
                toUserId: peerContext.remoteUserId,
                offer: pc.localDescription,
                callerName: getSelfDisplayName(session),
            });
        } catch (e) {
            console.error(e);
            setErrorHint("Microphone inaccessible ou refusé");
            hangup(false);
        }
    }, [peerContext, session, hangup]);

    const acceptIncoming = useCallback(async () => {
        const p = pendingIncoming;
        const s = socketRef.current;
        if (!p || !s?.connected) return;

        const { roomId, fromUserId, offer } = p;
        roomIdRef.current = roomId;
        remoteUserIdRef.current = fromUserId;
        setPendingIncoming(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

            pc.ontrack = (ev) => {
                if (remoteAudioRef.current && ev.streams[0]) {
                    remoteAudioRef.current.srcObject = ev.streams[0];
                    remoteAudioRef.current.play().catch(() => {});
                }
            };

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
        } catch (e) {
            console.error(e);
            setErrorHint("Impossible d’accepter l’appel");
            hangup(false);
        }
    }, [pendingIncoming, hangup]);

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
        setPendingIncoming(null);
        setPhase("idle");
    }, [pendingIncoming, peerContext, onAfterCallLogged]);

    useImperativeHandle(
        ref,
        () => ({
            startOutgoing,
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
                className="voice-call-modal-unified"
                dialogClassName="voice-call-modal__dialog"
                contentClassName="voice-call-modal__content"
                aria-labelledby="voice-call-modal-title"
            >
                <Modal.Body className="voice-call-modal__body text-center position-relative">
                    {phase === "ringing" && (
                        <>
                            <button
                                type="button"
                                className="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2"
                                onClick={rejectIncoming}
                                aria-label="Refuser l’appel"
                            />
                            <div className="voice-call-modal__avatar voice-call-modal__avatar--ring mb-3">
                                <i className="ri-phone-fill text-white" style={{ fontSize: "1.65rem" }} aria-hidden />
                            </div>
                            <p id="voice-call-modal-title" className="voice-call-modal__title mb-2 fw-semibold">
                                Appel entrant
                            </p>
                            <p className="voice-call-modal__subtitle small mb-4">
                                <strong className="text-white">{pendingIncoming?.callerName || "Contact"}</strong>
                                <br />
                                souhaite un appel vocal.
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
                                    <i className="ri-phone-fill" aria-hidden />
                                    Accepter
                                </button>
                            </div>
                        </>
                    )}

                    {phase === "outgoing" && (
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

                    {phase === "connected" && (
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
